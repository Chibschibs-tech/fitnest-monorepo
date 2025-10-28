import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {

    // Get cart ID from headers
    const cartId = request.headers
      .get("cookie")
      ?.split(";")
      .find((c) => c.trim().startsWith("cartId="))
      ?.split("=")[1]

    // Check all tables
    const allTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `

    // Check cart table structure
    let cartStructure = []
    try {
      cartStructure = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'cart'
        ORDER BY ordinal_position
      `
    } catch (error) {
      console.log("Cart table doesn't exist")
    }

    // Check cart_items table structure
    let cartItemsStructure = []
    try {
      cartItemsStructure = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'cart_items'
        ORDER BY ordinal_position
      `
    } catch (error) {
      console.log("Cart items table doesn't exist")
    }

    return NextResponse.json({
      cartId,
      allTables: allTables.map((t) => t.table_name),
      cartStructure,
      cartItemsStructure,
      hasCartTable: cartStructure.length > 0,
      hasCartItemsTable: cartItemsStructure.length > 0,
    })
  } catch (error) {
    console.error("Error debugging cart structure:", error)
    return NextResponse.json({
      error: "Failed to debug cart structure",
      details: error instanceof Error ? error.message : String(error),
    })
  }
}
