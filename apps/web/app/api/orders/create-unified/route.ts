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



    // Validate required fields

    if (!body.customer || !body.shipping || !body.order) {

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

        }

      }

    } catch (userError) {

      console.error("User handling failed:", userError)

      return NextResponse.json({ error: "Failed to handle user account" }, { status: 500 })

    }



    // Get cart items from unified cart_items table OR from request body

    const cookieStore = cookies()

    const cartId = cookieStore.get("cartId")?.value



    let cartItems = []

    let subscriptions = []

    let cartSubtotal = 0



    // First, try to get items from request body (if provided)

    if (body.order?.cartItems && Array.isArray(body.order.cartItems) && body.order.cartItems.length > 0) {

      cartItems = body.order.cartItems.map((item: any) => ({

        productId: item.productId,

        quantity: item.quantity,

        name: item.name || `Product ${item.productId}`,

        price: Number(item.price || 0),

        total: Number(item.price || 0) * Number(item.quantity || 1),

      }))

      cartSubtotal = body.order.cartSubtotal || cartItems.reduce((sum, item) => sum + item.total, 0)

    } else if (cartId) {

      // Fallback: fetch from database

      try {

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

      } catch (cartError) {

        console.warn("Error fetching cart items:", cartError)

      }

    }



    if (body.order?.mealPlan && !subscriptions.length) {

      const mealPlan = body.order.mealPlan

      subscriptions.push({

        plan_name: mealPlan.planName || mealPlan.planId || 'Unknown Plan',

        meal_types: mealPlan.mealTypes || [],

        days_per_week: mealPlan.daysPerWeek || mealPlan.mealsPerWeek || 5,

        duration_weeks: mealPlan.durationWeeks || (mealPlan.duration ? parseInt(mealPlan.duration) : 4),

        total_price: mealPlan.planPrice || mealPlan.price || 0,

        allergies: mealPlan.allergies || [],

        delivery_schedule: mealPlan.deliverySchedule || null,

      })

      cartSubtotal += mealPlan.planPrice || mealPlan.price || 0

    }



    // Check if we have items

    if (cartItems.length === 0 && subscriptions.length === 0) {

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

        const paymentMethod = body.payment?.method || 'cod'

        const orderResult = await sql`

          INSERT INTO orders (

            user_id, 

            total,

            status,

            payment_method,

            payment_status,

            delivery_address,

            delivery_date,

            created_at,

            updated_at

          ) 

          VALUES (

            ${userId}, 

            ${Math.round(totalAmount * 100)},

            'pending',

            ${paymentMethod},

            'pending',

            ${deliveryAddress},

            ${deliveryDate.toISOString()},

            ${now.toISOString()},

            ${now.toISOString()}

          )

          RETURNING id, user_id, total, status, payment_method, payment_status

        `



        const orderId = orderResult[0].id



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

      } catch (orderError) {

        console.error("Order creation failed:", orderError)

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

        const subPaymentMethod = body.payment?.method || 'cod'

        const subscription = await sql`

          INSERT INTO subscriptions (

            user_id,

            plan_variant_id,

            status,

            starts_at,

            renews_at,

            payment_method,

            payment_status,

            notes

          )

          VALUES (

            ${userId},

            ${planVariantId},

            'active',

            ${startsAt.toISOString()},

            ${renewsAt.toISOString()},

            ${subPaymentMethod},

            'pending',

            ${JSON.stringify({

              plan_name: sub.plan_name,

              meal_types: sub.meal_types,

              days_per_week: sub.days_per_week,

              duration_weeks: sub.duration_weeks,

              total_price: sub.total_price,

              shipping_address: deliveryAddress,

              allergies: (sub as any).allergies || [],

              delivery_schedule: (sub as any).delivery_schedule || null,

            })}

          )

          RETURNING id, user_id, plan_variant_id, status, payment_method, payment_status

        `



        const subscriptionId = subscription[0].id



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

      }

    } catch (clearError) {

      console.warn("Failed to clear cart:", clearError)

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

    } catch (emailError) {

      console.warn("Order confirmation email failed (non-blocking):", emailError)

    }



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



