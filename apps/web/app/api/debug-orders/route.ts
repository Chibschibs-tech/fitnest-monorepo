export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"

export async function GET() {
  try {

    // Check orders table structure
    const ordersColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'orders' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `

    // Check order_items table structure
    const orderItemsColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'order_items' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `

    // Check if tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('orders', 'order_items', 'users')
    `

    // Sample data from orders table
    let sampleOrders = []
    try {
      sampleOrders = await sql`SELECT * FROM orders LIMIT 3`
    } catch (e) {
      console.log("No orders table or no data")
    }

    return NextResponse.json({
      tables,
      ordersColumns,
      orderItemsColumns,
      sampleOrders,
    })
  } catch (error) {
    console.error("Debug orders error:", error)
    return NextResponse.json(
      {
        error: "Failed to debug orders",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
