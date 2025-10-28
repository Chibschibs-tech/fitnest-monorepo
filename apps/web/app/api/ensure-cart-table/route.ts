export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"

export async function GET() {
  try {

    // Check if cart_items table exists
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'cart_items'
    `

    if (tables.length === 0) {
      // Create cart_items table
      await sql`
        CREATE TABLE cart_items (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          product_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        )
      `

      return NextResponse.json({
        success: true,
        message: "Cart table created successfully",
      })
    } else {
      return NextResponse.json({
        success: true,
        message: "Cart table already exists",
      })
    }
  } catch (error) {
    console.error("Error ensuring cart table:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to ensure cart table exists",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
