import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { sendOrderConfirmationEmail } from "@/lib/email-utils"
import { cookies } from "next/headers"
import {
  calculateSubscriptionPrice,
  type MealPrice,
  type DiscountRule,
} from "@/lib/pricing-calculator"

export const dynamic = "force-dynamic"
export const revalidate = 0

/**
 * POST /api/orders/create-unified
 * Unified order creation that handles both Express Shop products and Meal Plan subscriptions
 * Uses the new cart_items table
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    console.log("=== UNIFIED ORDER CREATION START ===")
    console.log("Received order data:", JSON.stringify(body, null, 2))

    // Validate required fields
    if (!body.customer || !body.shipping || !body.order) {
      console.log("Missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get or create user
    let userId = null
    try {
      const existingUser = await sql`
        SELECT id FROM users WHERE email = ${body.customer.email}
      `

      if (existingUser.length > 0) {
        userId = existingUser[0].id
        console.log("Found existing user:", userId)
      } else {
        // Create a new user
        const tempPassword = Math.random().toString(36).slice(-8)
        try {
          const newUser = await sql`
            INSERT INTO users (name, email, password, role) 
            VALUES (
              ${`${body.customer.firstName} ${body.customer.lastName}`}, 
              ${body.customer.email}, 
              ${tempPassword},
              'customer'
            )
            RETURNING id, name, email
          `
          userId = newUser[0].id
          console.log("Created new user:", userId)
        } catch (userCreateError) {
          // Try without password if it's not required
          const newUser = await sql`
            INSERT INTO users (name, email, role) 
            VALUES (
              ${`${body.customer.firstName} ${body.customer.lastName}`}, 
              ${body.customer.email}, 
              'customer'
            )
            RETURNING id, name, email
          `
          userId = newUser[0].id
          console.log("Created new user without password:", userId)
        }
      }
    } catch (userError) {
      console.log("User handling failed:", userError)
      return NextResponse.json({ error: "Failed to handle user account" }, { status: 500 })
    }

    // Get cart items from unified cart_items table OR from request body
    const cookieStore = cookies()
    const cartId = cookieStore.get("cartId")?.value

    console.log("Cart ID from cookie:", cartId)
    console.log("Order data from body:", body.order)

    let cartItems = []
    let subscriptions = []
    let cartSubtotal = 0

    // First, try to get items from request body (if provided)
    if (body.order?.cartItems && Array.isArray(body.order.cartItems) && body.order.cartItems.length > 0) {
      console.log("Using cart items from request body")
      cartItems = body.order.cartItems.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
        name: item.name || `Product ${item.productId}`,
        price: Number(item.price || 0),
        total: Number(item.price || 0) * Number(item.quantity || 1),
      }))
      cartSubtotal = body.order.cartSubtotal || cartItems.reduce((sum, item) => sum + item.total, 0)
      console.log("Processed cart items from body:", cartItems)
    } else if (cartId) {
      // Fallback: fetch from database
      try {
        console.log("Fetching cart items from database")
        // Fetch all cart items (both products and subscriptions)
        const items = await sql`
          SELECT 
            ci.id,
            ci.item_type,
            ci.quantity,
            ci.unit_price,
            ci.total_price,
            ci.product_id,
            ci.plan_name,
            ci.meal_types,
            ci.days_per_week,
            ci.duration_weeks,
            p.name as product_name,
            p.imageurl as product_image
          FROM cart_items ci
          LEFT JOIN products p ON ci.product_id = p.id AND ci.item_type = 'product'
          WHERE ci.cart_id = ${cartId}
        `

        console.log("Raw cart items from DB:", items)

        // Separate products and subscriptions
        for (const item of items) {
          if (item.item_type === 'product') {
            cartItems.push({
              productId: item.product_id,
              quantity: item.quantity,
              name: item.product_name,
              price: Number(item.unit_price),
              total: Number(item.total_price),
            })
            cartSubtotal += Number(item.total_price)
          } else if (item.item_type === 'subscription') {
            subscriptions.push({
              plan_name: item.plan_name,
              meal_types: item.meal_types || [],
              days_per_week: item.days_per_week,
              duration_weeks: item.duration_weeks,
              total_price: Number(item.total_price),
            })
            cartSubtotal += Number(item.total_price)
          }
        }

        console.log("Processed cart items (products):", cartItems)
        console.log("Processed subscriptions:", subscriptions)
        console.log("Cart subtotal:", cartSubtotal)
      } catch (cartError) {
        console.log("Error fetching cart items:", cartError)
      }
    }

    // Also check for meal plan in request body (legacy support)
    if (body.order?.mealPlan && !subscriptions.length) {
      console.log("Processing meal plan from request body")
      const mealPlan = body.order.mealPlan
      subscriptions.push({
        plan_name: mealPlan.planName || mealPlan.planId || 'Unknown Plan',
        meal_types: mealPlan.mealTypes || [],
        days_per_week: mealPlan.mealsPerWeek || mealPlan.daysPerWeek || 7,
        duration_weeks: mealPlan.duration ? parseInt(mealPlan.duration) : 4,
        total_price: mealPlan.planPrice || mealPlan.price || 0,
      })
      cartSubtotal += mealPlan.planPrice || mealPlan.price || 0
    }

    // Check if we have items
    if (cartItems.length === 0 && subscriptions.length === 0) {
      console.log("No cart items or subscriptions found")
      return NextResponse.json(
        {
          error: "No items in cart",
          debug: { cartId, cartItemsFound: cartItems.length, subscriptionsFound: subscriptions.length },
        },
        { status: 400 },
      )
    }

    // Recalculate subscription totals on the server using pricing engine
    // and ignore any frontend-provided total_price for safety.
    for (const sub of subscriptions) {
      try {
        const mealPrices: MealPrice[] = await sql`
          SELECT meal_type, base_price_mad
          FROM meal_type_prices
          WHERE plan_name = ${sub.plan_name}
            AND meal_type = ANY(${sub.meal_types}::text[])
            AND is_active = true
        `

        if (mealPrices.length === 0) {
          console.warn("No meal_type_prices found for plan in unified order:", sub.plan_name)
          continue
        }

        const discountRules: DiscountRule[] = await sql`
          SELECT discount_type, condition_value, discount_percentage, stackable
          FROM discount_rules
          WHERE is_active = true
            AND (valid_from IS NULL OR valid_from <= NOW())
            AND (valid_to IS NULL OR valid_to >= NOW())
        `

        const result = calculateSubscriptionPrice(
          mealPrices,
          sub.days_per_week,
          sub.duration_weeks,
          discountRules,
          sub.plan_name,
          sub.meal_types,
        )

        sub.total_price = result.totalRoundedMAD
        ;(sub as any).pricing_breakdown = result

        cartSubtotal += result.totalRoundedMAD
      } catch (priceError) {
        console.error("Error recalculating subscription price in unified order:", priceError)
      }
    }

    // Calculate totals
    const shippingCost = body.order.shipping || 0
    const totalAmount = cartSubtotal + shippingCost

    console.log("Final totals:", { cartSubtotal, shippingCost, totalAmount })

    // Prepare delivery address
    const deliveryAddress = `${body.shipping.address}, ${body.shipping.city}, ${body.shipping.postalCode}`
    const deliveryDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
    const now = new Date()

    const results = {
      orders: [],
      subscriptions: [],
    }

    // Create orders for Express Shop products
    if (cartItems.length > 0) {
      try {
        const orderResult = await sql`
          INSERT INTO orders (
            user_id, 
            total,
            status,
            created_at,
            updated_at
          ) 
          VALUES (
            ${userId}, 
            ${Math.round(totalAmount * 100)},
            'pending',
            ${now.toISOString()},
            ${now.toISOString()}
          )
          RETURNING id, user_id, total, status
        `

        const orderId = orderResult[0].id
        console.log("Created order with ID:", orderId)

        // Add order items
        for (const item of cartItems) {
          await sql`
            INSERT INTO order_items (
              order_id, 
              product_id, 
              quantity, 
              unit_price,
              created_at
            ) 
            VALUES (
              ${orderId}, 
              ${item.productId}, 
              ${item.quantity}, 
              ${Math.round(item.price * 100)},
              ${now.toISOString()}
            )
          `
        }

        results.orders.push({
          id: orderId,
          type: 'express_shop',
          items: cartItems,
        })

        console.log("Added order items successfully")
      } catch (orderError) {
        console.log("Order creation failed:", orderError)
        return NextResponse.json(
          {
            error: "Failed to create order",
            details: orderError instanceof Error ? orderError.message : String(orderError),
          },
          { status: 500 },
        )
      }
    }

    // Create subscriptions for meal plans
    for (const sub of subscriptions) {
      try {
        // Find plan_variant_id from plan_name
        const planVariant = await sql`
          SELECT pv.id 
          FROM plan_variants pv
          JOIN meal_plans mp ON pv.meal_plan_id = mp.id
          WHERE mp.title = ${sub.plan_name}
          LIMIT 1
        `

        if (planVariant.length === 0) {
          console.warn(`Plan variant not found for plan: ${sub.plan_name}`)
          continue
        }

        const planVariantId = planVariant[0].id

        // Calculate dates
        const startsAt = new Date()
        const renewsAt = new Date(startsAt)
        renewsAt.setDate(renewsAt.getDate() + (sub.duration_weeks * 7))

        // Create subscription with status "active" (track "new" in notes)
        const subscription = await sql`
          INSERT INTO subscriptions (
            user_id,
            plan_variant_id,
            status,
            starts_at,
            renews_at,
            notes
          )
          VALUES (
            ${userId},
            ${planVariantId},
            'active',
            ${startsAt.toISOString()},
            ${renewsAt.toISOString()},
            ${JSON.stringify({
              subscription_status: 'new',
              payment_status: 'pending',
              plan_name: sub.plan_name,
              meal_types: sub.meal_types,
              days_per_week: sub.days_per_week,
              duration_weeks: sub.duration_weeks,
              total_price: sub.total_price,
              shipping_address: deliveryAddress,
              payment_method: body.order.payment_method || 'pending',
              created_at: new Date().toISOString(),
            })}
          )
          RETURNING id, user_id, plan_variant_id, status
        `

        const subscriptionId = subscription[0].id
        console.log("Created subscription with ID:", subscriptionId)

        results.subscriptions.push({
          id: subscriptionId,
          plan_name: sub.plan_name,
          status: 'new', // Tracked in notes
        })
      } catch (subError) {
        console.error("Error creating subscription:", subError)
        // Continue with other subscriptions
      }
    }

    // Clear the cart (already done by fetching items, but ensure it's cleared)
    try {
      if (cartId) {
        await sql`DELETE FROM cart_items WHERE cart_id = ${cartId}`
        console.log("Cleared cart_items successfully")
      }
    } catch (clearError) {
      console.log("Failed to clear cart:", clearError)
      // Continue anyway - order/subscription is created
    }

    // Send order confirmation email
    try {
      const orderDataForEmail = {
        orderId: results.orders[0]?.id || results.subscriptions[0]?.id,
        customerName: `${body.customer.firstName} ${body.customer.lastName}`,
        customerEmail: body.customer.email,
        totalAmount: totalAmount,
        deliveryAddress: deliveryAddress,
        deliveryDate: deliveryDate.toISOString(),
        items: cartItems,
        subscriptions: subscriptions,
      }
      await sendOrderConfirmationEmail(orderDataForEmail)
      console.log("Order confirmation email sent successfully")
    } catch (emailError) {
      console.log("Order confirmation email failed (non-blocking):", emailError)
    }

    console.log("=== UNIFIED ORDER CREATION SUCCESS ===")

    return NextResponse.json({
      success: true,
      orders: results.orders,
      subscriptions: results.subscriptions,
      userId: userId,
      message: "Order and subscriptions created successfully",
    })
  } catch (error) {
    console.error("=== UNIFIED ORDER CREATION ERROR ===")
    console.error("Error creating order:", error)
    return NextResponse.json(
      {
        error: "Failed to create order",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

