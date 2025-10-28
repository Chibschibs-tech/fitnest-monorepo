import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const cookieStore = cookies()
    const cartId = cookieStore.get("cartId")?.value

    // Check what's actually in the cart table
    const cartData = await sql`SELECT * FROM cart LIMIT 5`

    // Check what's in products table
    const productsData = await sql`SELECT id, name FROM products LIMIT 3`

    // Check if we can join them
    let joinTest = "No cart items to test"
    if (cartId) {
      try {
        joinTest = await sql`
          SELECT c.*, p.name 
          FROM cart c 
          LEFT JOIN products p ON c.product_id::text = p.id 
          WHERE c.id = ${cartId}
        `
      } catch (error) {
        joinTest = `Join error: ${error instanceof Error ? error.message : String(error)}`
      }
    }

    return NextResponse.json({
      cartId,
      cartData,
      productsData,
      joinTest,
      cartDataTypes: "cart.product_id is integer, products.id is text",
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, productId, quantity } = body

    const cookieStore = cookies()
    const cartId = cookieStore.get("cartId")?.value

    if (!cartId) {
      return NextResponse.json({ error: "No cart ID found" }, { status: 400 })
    }

    if (action === "update") {
      const result = await sql`
        UPDATE cart 
        SET quantity = ${quantity}
        WHERE id = ${cartId} AND product_id = ${productId}
      `
      return NextResponse.json({ success: true, result, action: "update" })
    }

    if (action === "remove") {
      const result = await sql`
        DELETE FROM cart 
        WHERE id = ${cartId} AND product_id = ${productId}
      `
      return NextResponse.json({ success: true, result, action: "remove" })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
