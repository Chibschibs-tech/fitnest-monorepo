import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {

    // Check what tables exist
    const tables = await sql`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name IN ('cart', 'cart_items', 'products')
      ORDER BY table_name, ordinal_position
    `

    // Check if we have any cart data
    let cartData = []
    let cartItemsData = []
    let productsData = []

    try {
      cartData = await sql`SELECT * FROM cart LIMIT 5`
    } catch (e) {
      console.log("Cart table doesn't exist or is empty")
    }

    try {
      cartItemsData = await sql`SELECT * FROM cart_items LIMIT 5`
    } catch (e) {
      console.log("Cart_items table doesn't exist or is empty")
    }

    try {
      productsData = await sql`SELECT id, name, price FROM products LIMIT 5`
    } catch (e) {
      console.log("Products table doesn't exist or is empty")
    }

    return NextResponse.json({
      tables,
      sampleData: {
        cart: cartData,
        cart_items: cartItemsData,
        products: productsData,
      },
    })
  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json(
      {
        error: "Debug failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
