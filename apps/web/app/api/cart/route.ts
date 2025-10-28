import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const cookieStore = cookies()
    const cartId = cookieStore.get("cartId")?.value

    console.log("GET /api/cart - Cart ID:", cartId)

    if (!cartId) {
      return NextResponse.json({
        items: [],
        subtotal: 0,
        cartId: null,
      })
    }


    // Use the cart table (which exists and has data)
    const cartItems = await sql`
      SELECT 
        c.id as cart_id,
        c.product_id,
        c.quantity,
        p.id as product_id_actual,
        p.name,
        p.price,
        p.saleprice,
        p.imageurl
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.id = ${cartId}
      ORDER BY c.created_at DESC
    `

    console.log("Raw cart items:", cartItems)

    // Format the response
    const items = cartItems.map((item) => ({
      id: `${item.cart_id}-${item.product_id}`, // Unique identifier
      productId: item.product_id,
      quantity: item.quantity,
      name: item.name,
      price: Number(item.price) / 100, // Convert from cents to MAD
      salePrice: item.saleprice ? Number(item.saleprice) / 100 : null,
      imageUrl: item.imageurl,
    }))

    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => {
      const price = item.salePrice || item.price
      return sum + price * item.quantity
    }, 0)

    console.log("Formatted items:", items)
    console.log("Subtotal:", subtotal)

    return NextResponse.json({
      items,
      subtotal,
      cartId,
    })
  } catch (error) {
    console.error("Error fetching cart:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch cart",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { productId, quantity = 1 } = body

    console.log("POST /api/cart - Adding product:", productId, "quantity:", quantity)

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    const cookieStore = cookies()
    let cartId = cookieStore.get("cartId")?.value

    if (!cartId) {
      cartId = uuidv4()
      console.log("Generated new cart ID:", cartId)
    }


    // Convert productId to integer (products table uses integer IDs)
    const productIdInt = Number.parseInt(productId)
    if (isNaN(productIdInt)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
    }

    // Check if product exists
    const product = await sql`SELECT id FROM products WHERE id = ${productIdInt}`
    if (product.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Check if item already exists in cart
    const existingItem = await sql`
      SELECT quantity FROM cart
      WHERE id = ${cartId} AND product_id = ${productIdInt}
    `

    if (existingItem.length > 0) {
      // Update quantity if item exists
      const newQuantity = existingItem[0].quantity + quantity
      await sql`
        UPDATE cart
        SET quantity = ${newQuantity}
        WHERE id = ${cartId} AND product_id = ${productIdInt}
      `
      console.log("Updated existing item quantity to:", newQuantity)
    } else {
      // Add new item to cart
      await sql`
        INSERT INTO cart (id, product_id, quantity, created_at)
        VALUES (${cartId}, ${productIdInt}, ${quantity}, CURRENT_TIMESTAMP)
      `
      console.log("Added new item to cart")
    }

    // Set the cartId cookie
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
      { error: "Failed to add item to cart", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { productId, quantity } = body

    console.log("PUT /api/cart - Updating product:", productId, "quantity:", quantity)

    if (!productId || quantity === undefined) {
      return NextResponse.json({ error: "Product ID and quantity are required" }, { status: 400 })
    }

    const cookieStore = cookies()
    const cartId = cookieStore.get("cartId")?.value

    if (!cartId) {
      return NextResponse.json({ error: "No cart found" }, { status: 400 })
    }

    const productIdInt = Number.parseInt(productId)

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      await sql`
        DELETE FROM cart 
        WHERE id = ${cartId} AND product_id = ${productIdInt}
      `
      console.log("Removed item from cart")
    } else {
      // Update quantity
      await sql`
        UPDATE cart 
        SET quantity = ${quantity}
        WHERE id = ${cartId} AND product_id = ${productIdInt}
      `
      console.log("Updated item quantity to:", quantity)
    }

    return NextResponse.json({ success: true, message: "Cart updated" })
  } catch (error) {
    console.error("Error updating cart:", error)
    return NextResponse.json(
      { error: "Failed to update cart", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const productId = url.searchParams.get("id")

    console.log("DELETE /api/cart - Removing product:", productId)

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    const cookieStore = cookies()
    const cartId = cookieStore.get("cartId")?.value

    if (!cartId) {
      return NextResponse.json({ error: "No cart found" }, { status: 400 })
    }

    const productIdInt = Number.parseInt(productId)

    await sql`
      DELETE FROM cart 
      WHERE id = ${cartId} AND product_id = ${productIdInt}
    `

    console.log("Removed product from cart:", productId)

    return NextResponse.json({ success: true, message: "Item removed from cart" })
  } catch (error) {
    console.error("Error removing from cart:", error)
    return NextResponse.json(
      { error: "Failed to remove item", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
