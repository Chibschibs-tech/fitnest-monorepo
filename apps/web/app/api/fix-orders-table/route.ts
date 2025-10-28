export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"

export async function POST() {
  try {

    console.log("=== FIXING ORDERS TABLE ===")

    // Check current orders table structure
    const currentColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'orders' AND table_schema = 'public'
      ORDER BY ordinal_position
    `

    console.log("Current orders columns:", currentColumns)

    // Check if total column exists
    const hasTotalColumn = currentColumns.some((col) => col.column_name === "total")
    const hasTotalAmountColumn = currentColumns.some((col) => col.column_name === "total_amount")

    if (hasTotalColumn) {
      return NextResponse.json({
        success: true,
        message: "Orders table already has 'total' column",
        action: "none",
      })
    }

    if (hasTotalAmountColumn) {
      // Add alias/view for total column
      console.log("Found total_amount column, creating compatibility")
      return NextResponse.json({
        success: true,
        message: "Orders table has 'total_amount' column - will use this for total",
        action: "use_total_amount",
        recommendation: "Update order creation API to use 'total_amount' instead of 'total'",
      })
    }

    // Add the missing total column
    console.log("Adding total column to orders table...")

    await sql`
      ALTER TABLE orders 
      ADD COLUMN total INTEGER DEFAULT 0
    `

    console.log("Successfully added total column")

    // Update any existing orders to have a total value
    const existingOrders = await sql`
      SELECT id FROM orders WHERE total IS NULL OR total = 0
    `

    if (existingOrders.length > 0) {
      console.log(`Updating ${existingOrders.length} existing orders...`)

      for (const order of existingOrders) {
        // Calculate total from order_items if they exist
        const orderItems = await sql`
          SELECT COALESCE(SUM(price * quantity), 0) as calculated_total
          FROM order_items 
          WHERE order_id = ${order.id}
        `

        const calculatedTotal = orderItems[0]?.calculated_total || 0

        await sql`
          UPDATE orders 
          SET total = ${calculatedTotal}
          WHERE id = ${order.id}
        `
      }
    }

    // Verify the fix
    const updatedColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'orders' AND table_schema = 'public'
      ORDER BY ordinal_position
    `

    return NextResponse.json({
      success: true,
      message: "Successfully added 'total' column to orders table",
      action: "added_column",
      beforeColumns: currentColumns.map((c) => c.column_name),
      afterColumns: updatedColumns.map((c) => c.column_name),
      updatedExistingOrders: existingOrders.length,
    })
  } catch (error) {
    console.error("Error fixing orders table:", error)
    return NextResponse.json(
      {
        error: "Failed to fix orders table",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
