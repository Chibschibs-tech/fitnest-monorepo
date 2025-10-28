export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"

export async function GET() {
  try {

    // Create cart_items table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        cart_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create index for performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id)
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id)
    `

    // Check if products table has the right columns
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      AND table_schema = 'public'
      ORDER BY column_name
    `

    return NextResponse.json({
      success: true,
      message: "Cart schema fixed",
      productColumns: columns,
    })
  } catch (error) {
    console.error("Error fixing cart schema:", error)
    return NextResponse.json(
      {
        error: "Failed to fix cart schema",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
