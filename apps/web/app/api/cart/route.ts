import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"
import { calculateSubscriptionPrice } from "@/lib/pricing-calculator"

export const dynamic = "force-dynamic"

/**
 * GET /api/cart
 * Retrieve cart items (both products and subscriptions)
 */
export async function GET() {
  try {
    const cookieStore = cookies()
    const cartId = cookieStore.get("cartId")?.value

    if (!cartId) {
      return NextResponse.json({
        items: [],
        subtotal: 0,
        cartId: null,
      })
    }

    // Fetch all cart items (products and subscriptions)
    const cartItems = await sql`
      SELECT 
        ci.id,
        ci.cart_id,
        ci.item_type,
        ci.quantity,
        ci.unit_price,
        ci.total_price,
        ci.plan_name,
        ci.meal_types,
        ci.days_per_week,
        ci.duration_weeks,
        -- Product fields
        ci.product_id,
        p.name as product_name,
        p.imageurl as product_image,
        p.saleprice as product_sale_price,
        p.price as product_price
      FROM cart_items ci
      LEFT JOIN products p ON ci.product_id = p.id AND ci.item_type = 'product'
      WHERE ci.cart_id = ${cartId}
      ORDER BY ci.created_at DESC
    `

    // Format items based on type
    const items = cartItems.map((item: any) => {
      if (item.item_type === 'product') {
        return {
          id: item.id,
          item_type: 'product' as const,
          product_id: item.product_id,
          product_name: item.product_name,
          product_image: item.product_image,
          quantity: item.quantity,
          unit_price: Number(item.unit_price),
          total_price: Number(item.total_price),
        }
      } else {
        return {
          id: item.id,
          item_type: 'subscription' as const,
          plan_name: item.plan_name,
          meal_types: item.meal_types || [],
          days_per_week: item.days_per_week,
          duration_weeks: item.duration_weeks,
          quantity: item.quantity, // Always 1 for subscriptions
          unit_price: Number(item.unit_price),
          total_price: Number(item.total_price),
        }
      }
    })

    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0)

    return NextResponse.json({
      items,
      subtotal: Math.round(subtotal * 100) / 100,
      cartId,
    })
  } catch (error) {
    console.error("Error fetching cart:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch cart",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/cart
 * Add item to cart (product or subscription)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { item_type, product_id, quantity = 1, plan_name, meal_types, days_per_week, duration_weeks } = body

    // Validate item_type
    if (!item_type || !['product', 'subscription'].includes(item_type)) {
      return NextResponse.json(
        { error: "item_type must be 'product' or 'subscription'" },
        { status: 400 }
      )
    }

    const cookieStore = cookies()
    let cartId = cookieStore.get("cartId")?.value

    if (!cartId) {
      cartId = uuidv4()
    }

    let unitPrice = 0
    let totalPrice = 0

    if (item_type === 'product') {
      // Validate product
      if (!product_id) {
        return NextResponse.json({ error: "product_id is required for products" }, { status: 400 })
      }

      const productIdInt = Number.parseInt(product_id)
      if (isNaN(productIdInt)) {
        return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
      }

      // Check if product exists
      const product = await sql`
        SELECT id, price, saleprice FROM products WHERE id = ${productIdInt}
      `
      if (product.length === 0) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 })
      }

      // Calculate price (use sale price if available)
      const price = product[0].saleprice || product[0].price
      unitPrice = Number(price) / 100 // Convert from cents
      totalPrice = unitPrice * quantity

      // Check if product already in cart
      const existingItem = await sql`
        SELECT id, quantity FROM cart_items
        WHERE cart_id = ${cartId} AND product_id = ${productIdInt} AND item_type = 'product'
      `

      if (existingItem.length > 0) {
        // Update quantity
        const newQuantity = existingItem[0].quantity + quantity
        const newTotalPrice = unitPrice * newQuantity
        
        await sql`
          UPDATE cart_items
          SET quantity = ${newQuantity}, total_price = ${newTotalPrice}, updated_at = NOW()
          WHERE id = ${existingItem[0].id}
        `

        const response = NextResponse.json({ success: true, message: "Item updated in cart" })
        response.cookies.set({
          name: "cartId",
          value: cartId,
          httpOnly: true,
          path: "/",
          sameSite: "strict",
          maxAge: 60 * 60 * 24 * 30, // 30 days
        })
        return response
      }

      // Insert new product item
      await sql`
        INSERT INTO cart_items (
          cart_id, item_type, product_id, quantity, unit_price, total_price
        )
        VALUES (${cartId}, 'product', ${productIdInt}, ${quantity}, ${unitPrice}, ${totalPrice})
      `

    } else if (item_type === 'subscription') {
      // Validate subscription fields
      if (!plan_name || !meal_types || !Array.isArray(meal_types) || meal_types.length === 0) {
        return NextResponse.json(
          { error: "plan_name and meal_types (array) are required for subscriptions" },
          { status: 400 }
        )
      }

      if (!days_per_week || days_per_week < 1 || days_per_week > 7) {
        return NextResponse.json(
          { error: "days_per_week must be between 1 and 7" },
          { status: 400 }
        )
      }

      if (!duration_weeks || duration_weeks < 1) {
        return NextResponse.json(
          { error: "duration_weeks must be at least 1" },
          { status: 400 }
        )
      }

      // Calculate subscription price using pricing API
      try {
        const mealPrices = await sql`
          SELECT meal_type, base_price_mad
          FROM meal_type_prices
          WHERE plan_name = ${plan_name} 
            AND meal_type = ANY(${meal_types}::text[]) 
            AND is_active = true
        `

        if (mealPrices.length !== meal_types.length) {
          return NextResponse.json(
            { error: "Some meal types not found for this plan" },
            { status: 404 }
          )
        }

        const discountRules = await sql`
          SELECT discount_type, condition_value, discount_percentage, stackable
          FROM discount_rules
          WHERE is_active = true
            AND (valid_from IS NULL OR valid_from <= NOW())
            AND (valid_to IS NULL OR valid_to >= NOW())
        `

        const pricingResult = calculateSubscriptionPrice(
          mealPrices as any[],
          days_per_week,
          duration_weeks,
          discountRules as any[],
          plan_name,
          meal_types
        )

        unitPrice = pricingResult.totalRoundedMAD
        totalPrice = unitPrice // Subscriptions always quantity 1

      } catch (pricingError) {
        console.error("Error calculating subscription price:", pricingError)
        return NextResponse.json(
          { error: "Failed to calculate subscription price" },
          { status: 500 }
        )
      }

      // Check if subscription already in cart (same config)
      const existingSubscription = await sql`
        SELECT id FROM cart_items
        WHERE cart_id = ${cartId} 
          AND item_type = 'subscription'
          AND plan_name = ${plan_name}
          AND meal_types = ${meal_types}::text[]
          AND days_per_week = ${days_per_week}
          AND duration_weeks = ${duration_weeks}
      `

      if (existingSubscription.length > 0) {
        return NextResponse.json(
          { error: "This subscription configuration is already in your cart" },
          { status: 409 }
        )
      }

      // Insert new subscription item
      await sql`
        INSERT INTO cart_items (
          cart_id, item_type, plan_name, meal_types, days_per_week, duration_weeks,
          quantity, unit_price, total_price
        )
        VALUES (
          ${cartId}, 'subscription', ${plan_name}, ${meal_types}::text[], 
          ${days_per_week}, ${duration_weeks}, 1, ${unitPrice}, ${totalPrice}
        )
      `
    }

    // Set cartId cookie
    const response = NextResponse.json({ success: true, message: "Item added to cart" })
    response.cookies.set({
      name: "cartId",
      value: cartId,
      httpOnly: true,
      path: "/",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    return response
  } catch (error) {
    console.error("Error adding to cart:", error)
    return NextResponse.json(
      {
        error: "Failed to add item to cart",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/cart
 * Update cart item (quantity for products, config for subscriptions)
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { item_id, quantity, meal_types, days_per_week, duration_weeks } = body

    if (!item_id) {
      return NextResponse.json({ error: "item_id is required" }, { status: 400 })
    }

    const cookieStore = cookies()
    const cartId = cookieStore.get("cartId")?.value

    if (!cartId) {
      return NextResponse.json({ error: "No cart found" }, { status: 400 })
    }

    // Get the item
    const item = await sql`
      SELECT * FROM cart_items WHERE id = ${item_id} AND cart_id = ${cartId}
    `

    if (item.length === 0) {
      return NextResponse.json({ error: "Item not found in cart" }, { status: 404 })
    }

    const cartItem = item[0]

    if (cartItem.item_type === 'product') {
      // Update product quantity
      if (quantity === undefined) {
        return NextResponse.json({ error: "quantity is required for products" }, { status: 400 })
      }

      if (quantity <= 0) {
        // Remove item
        await sql`DELETE FROM cart_items WHERE id = ${item_id}`
        return NextResponse.json({ success: true, message: "Item removed from cart" })
      }

      const newTotalPrice = Number(cartItem.unit_price) * quantity
      await sql`
        UPDATE cart_items
        SET quantity = ${quantity}, total_price = ${newTotalPrice}, updated_at = NOW()
        WHERE id = ${item_id}
      `

    } else if (cartItem.item_type === 'subscription') {
      // Update subscription config (requires recalculation)
      const plan_name = cartItem.plan_name
      const finalMealTypes = meal_types || cartItem.meal_types
      const finalDaysPerWeek = days_per_week || cartItem.days_per_week
      const finalDurationWeeks = duration_weeks || cartItem.duration_weeks

      // Recalculate price
      const mealPrices = await sql`
        SELECT meal_type, base_price_mad
        FROM meal_type_prices
        WHERE plan_name = ${plan_name} 
          AND meal_type = ANY(${finalMealTypes}::text[]) 
          AND is_active = true
      `

      if (mealPrices.length !== finalMealTypes.length) {
        return NextResponse.json(
          { error: "Some meal types not found for this plan" },
          { status: 404 }
        )
      }

      const discountRules = await sql`
        SELECT discount_type, condition_value, discount_percentage, stackable
        FROM discount_rules
        WHERE is_active = true
          AND (valid_from IS NULL OR valid_from <= NOW())
          AND (valid_to IS NULL OR valid_to >= NOW())
      `

      const pricingResult = calculateSubscriptionPrice(
        mealPrices as any[],
        finalDaysPerWeek,
        finalDurationWeeks,
        discountRules as any[],
        plan_name,
        finalMealTypes
      )

      await sql`
        UPDATE cart_items
        SET 
          meal_types = ${finalMealTypes}::text[],
          days_per_week = ${finalDaysPerWeek},
          duration_weeks = ${finalDurationWeeks},
          unit_price = ${pricingResult.totalRoundedMAD},
          total_price = ${pricingResult.totalRoundedMAD},
          updated_at = NOW()
        WHERE id = ${item_id}
      `
    }

    return NextResponse.json({ success: true, message: "Cart item updated" })
  } catch (error) {
    console.error("Error updating cart:", error)
    return NextResponse.json(
      {
        error: "Failed to update cart",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/cart
 * Remove item from cart
 */
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const itemId = url.searchParams.get("id")

    if (!itemId) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 })
    }

    const cookieStore = cookies()
    const cartId = cookieStore.get("cartId")?.value

    if (!cartId) {
      return NextResponse.json({ error: "No cart found" }, { status: 400 })
    }

    const itemIdInt = Number.parseInt(itemId)
    if (isNaN(itemIdInt)) {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 })
    }

    await sql`
      DELETE FROM cart_items 
      WHERE id = ${itemIdInt} AND cart_id = ${cartId}
    `

    return NextResponse.json({ success: true, message: "Item removed from cart" })
  } catch (error) {
    console.error("Error removing from cart:", error)
    return NextResponse.json(
      {
        error: "Failed to remove item",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
