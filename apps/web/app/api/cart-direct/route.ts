export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

// Helper function to get column names
async function getTableColumns(tableName: string) {

  const columns = await sql`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = ${tableName}
  `

  return columns.map((col) => col.column_name)
}

export async function GET() {
  return NextResponse.json({ message: "Cart Direct API is working" })
}

export async function POST(request: Request) {
  try {
    // Get user session
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get user ID
    const userId = session.user.id

    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 400 })
    }

    // Parse request body
    const body = await request.json()
    const { productId, quantity } = body

    // Validate input
    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json({ error: "Invalid product ID or quantity" }, { status: 400 })
    }

    // Initialize Neon SQL client

    // Ensure cart table exists
    await sql`
      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Check if product exists
    const product = await sql`SELECT id FROM products WHERE id = ${productId}`

    if (product.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Check if item already exists in cart
    const existingItem = await sql`
      SELECT id, quantity FROM cart_items 
      WHERE user_id = ${userId} AND product_id = ${productId}
    `

    if (existingItem.length > 0) {
      // Update existing cart item
      const newQuantity = existingItem[0].quantity + quantity

      await sql`
        UPDATE cart_items 
        SET quantity = ${newQuantity}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${existingItem[0].id}
      `

      return NextResponse.json({
        success: true,
        message: "Cart updated successfully",
        quantity: newQuantity,
      })
    } else {
      // Add new item to cart
      await sql`
        INSERT INTO cart_items (user_id, product_id, quantity)
        VALUES (${userId}, ${productId}, ${quantity})
      `

      return NextResponse.json({
        success: true,
        message: "Item added to cart successfully",
        quantity,
      })
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to add item to cart",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

// Add PUT and DELETE methods for updating and removing cart items
export async function PUT(request: Request) {
  try {
    const data = await request.json()

    // Get user session
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const userId = session.user.id


    // Validate required fields
    if (!data.itemId || !data.quantity) {
      return NextResponse.json({ error: "Missing required fields: itemId and quantity are required" }, { status: 400 })
    }

    // Check if the item exists and belongs to the user
    const existingItem = await sql`
      SELECT id FROM cart_items
      WHERE id = ${data.itemId} AND user_id = ${userId}
      LIMIT 1
    `

    if (existingItem.length === 0) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 })
    }

    // Update the item quantity
    const result = await sql`
      UPDATE cart_items
      SET quantity = ${data.quantity}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${data.itemId}
      RETURNING id, product_id as "productId", quantity
    `

    return NextResponse.json({
      ...result[0],
      message: "Cart updated",
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to update cart item",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get("id")
    const clearAll = searchParams.get("clearAll")

    // Get user session
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const userId = session.user.id


    if (clearAll === "true") {
      // Clear all items from the cart
      await sql`
        DELETE FROM cart_items
        WHERE user_id = ${userId}
      `

      return NextResponse.json({
        message: "Cart cleared",
      })
    }

    if (!itemId) {
      return NextResponse.json({ error: "Missing required parameter: id" }, { status: 400 })
    }

    // Check if the item exists and belongs to the user
    const existingItem = await sql`
      SELECT id FROM cart_items
      WHERE id = ${itemId} AND user_id = ${userId}
      LIMIT 1
    `

    if (existingItem.length === 0) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 })
    }

    // Delete the item
    await sql`
      DELETE FROM cart_items
      WHERE id = ${itemId}
    `

    return NextResponse.json({
      message: "Item removed from cart",
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to remove cart item",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
