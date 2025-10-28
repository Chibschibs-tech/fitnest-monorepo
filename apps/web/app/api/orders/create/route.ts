export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"
import { sendOrderConfirmationEmail } from "@/lib/email-utils"

// Map meal plan IDs to database plan IDs
const getPlanDatabaseId = (planId: string): number => {
  const planMapping: Record<string, number> = {
    "weight-loss": 1,
    "stay-fit": 2,
    "muscle-gain": 3,
    keto: 4,
  }
  return planMapping[planId] || 1 // Default to plan 1 if not found
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    console.log("=== ORDER CREATION START ===")
    console.log("Received order data:", JSON.stringify(body, null, 2))

    // Validate required fields
    if (!body.customer || !body.shipping || !body.order) {
      console.log("Missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get or create user (user_id is required)
    let userId = null
    try {
      const existingUser = await sql`
        SELECT id FROM users WHERE email = ${body.customer.email}
      `

      if (existingUser.length > 0) {
        userId = existingUser[0].id
        console.log("Found existing user:", userId)
      } else {
        // Create a new user - need to handle password requirement
        const tempPassword = Math.random().toString(36).slice(-8)

        try {
          const newUser = await sql`
            INSERT INTO users (name, email, password, role) 
            VALUES (
              ${`${body.customer.firstName} ${body.customer.lastName}`}, 
              ${body.customer.email}, 
              ${tempPassword},
              'user'
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
              'user'
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

    // Get cart items using the correct structure
    const cartId = request.headers
      .get("cookie")
      ?.split(";")
      .find((c) => c.trim().startsWith("cartId="))
      ?.split("=")[1]

    console.log("Cart ID from cookie:", cartId)

    let cartItems = []
    let cartSubtotal = 0

    if (cartId) {
      try {
        // Query cart table directly using the correct structure
        const items = await sql`
          SELECT 
            c.product_id,
            c.quantity,
            p.name,
            p.price,
            p.saleprice
          FROM cart c
          JOIN products p ON c.product_id = p.id
          WHERE c.id = ${cartId}
        `

        console.log("Raw cart items from DB:", items)

        cartItems = items.map((item) => ({
          productId: item.product_id,
          quantity: item.quantity,
          name: item.name,
          price: (item.saleprice || item.price) / 100, // Convert from cents
        }))

        cartSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
        console.log("Processed cart items:", cartItems)
        console.log("Cart subtotal:", cartSubtotal)
      } catch (cartError) {
        console.log("Error fetching cart items:", cartError)
      }
    }

    // Handle meal plan data
    const mealPlan = body.order.mealPlan
    let mealPlanPrice = 0
    let planId = 1 // Default plan ID

    if (mealPlan) {
      planId = getPlanDatabaseId(mealPlan.planId) // Use the mapping function
      mealPlanPrice = mealPlan.planPrice || mealPlan.price || 0
      console.log("Meal plan data:", mealPlan)
      console.log("Meal plan price:", mealPlanPrice)
      console.log("Plan ID (mapped):", planId)
    }

    // Check if we have either cart items or meal plan
    if (cartItems.length === 0 && !mealPlan) {
      console.log("No cart items or meal plan found")
      return NextResponse.json(
        {
          error: "No items in cart or meal plan selected",
          debug: { cartId, cartItemsFound: cartItems.length, mealPlanExists: !!mealPlan },
        },
        { status: 400 },
      )
    }

    // Calculate totals
    const shippingCost = body.order.shipping || 0
    const totalAmount = cartSubtotal + mealPlanPrice + shippingCost

    console.log("Final totals:", { cartSubtotal, mealPlanPrice, shippingCost, totalAmount })

    // Prepare required fields - ALL REQUIRED FIELDS FROM MIGRATION
    const deliveryAddress = `${body.shipping.address}, ${body.shipping.city}, ${body.shipping.postalCode}`
    const deliveryDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
    const now = new Date()

    console.log("Order details:", {
      userId,
      planId,
      totalAmount: Math.round(totalAmount * 100),
      deliveryAddress,
      deliveryDate: deliveryDate.toISOString(),
    })

    // Create order using the EXACT schema from migration
    let orderResult
    try {
      orderResult = await sql`
        INSERT INTO orders (
          user_id, 
          plan_id,
          total_amount,
          status,
          delivery_address,
          delivery_date,
          created_at,
          updated_at
        ) 
        VALUES (
          ${userId}, 
          ${planId},
          ${Math.round(totalAmount * 100)},
          'pending',
          ${deliveryAddress},
          ${deliveryDate.toISOString()},
          ${now.toISOString()},
          ${now.toISOString()}
        )
        RETURNING id, user_id, total_amount, delivery_address, delivery_date, status
      `
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

    const orderId = orderResult[0].id
    console.log("Created order with ID:", orderId)

    // Add order items (cart items)
    try {
      for (const item of cartItems) {
        await sql`
          INSERT INTO order_items (
            order_id, 
            product_id, 
            quantity, 
            price,
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
      console.log("Added order items successfully")
    } catch (itemsError) {
      console.log("Failed to add order items:", itemsError)
      // Continue anyway, order is created
    }

    // Clear the cart
    try {
      if (cartId) {
        await sql`DELETE FROM cart WHERE id = ${cartId}`
        console.log("Cleared cart successfully")
      }
    } catch (clearError) {
      console.log("Failed to clear cart:", clearError)
      // Continue anyway
    }

    // Send order confirmation email (don't block order if email fails)
    try {
      const orderDataForEmail = {
        orderId: orderId,
        customerName: `${body.customer.firstName} ${body.customer.lastName}`,
        customerEmail: body.customer.email,
        totalAmount: totalAmount,
        deliveryAddress: deliveryAddress,
        deliveryDate: deliveryDate.toISOString(),
        items: cartItems,
      }
      await sendOrderConfirmationEmail(orderDataForEmail)
      console.log("Order confirmation email sent successfully")
    } catch (emailError) {
      console.log("Order confirmation email failed (non-blocking):", emailError)
    }

    console.log("=== ORDER CREATION SUCCESS ===")

    return NextResponse.json({
      success: true,
      orderId: orderId,
      userId: userId,
      message: "Order created successfully",
    })
  } catch (error) {
    console.error("=== ORDER CREATION ERROR ===")
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
