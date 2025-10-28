export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"

export async function GET() {
  try {

    // Drop existing cart table if it has wrong structure
    await sql`DROP TABLE IF EXISTS cart CASCADE`

    // Create proper cart_items table
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

    // Create indexes for performance
    await sql`CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id)`

    // Check products table structure to see what image column exists
    const productColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      AND table_schema = 'public'
      AND column_name LIKE '%image%'
    `

    return NextResponse.json({
      success: true,
      message: "Cart tables set up successfully",
      productImageColumns: productColumns,
    })
  } catch (error) {
    console.error("Error setting up cart tables:", error)
    return NextResponse.json(
      {
        error: "Failed to set up cart tables",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
