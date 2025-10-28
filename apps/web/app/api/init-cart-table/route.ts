export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"

export async function GET() {
  try {

    // Create the cart_items table
    await sql`
      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `

    return NextResponse.json({
      success: true,
      message: "Cart table initialized successfully",
    })
  } catch (error) {
    console.error("Error initializing cart table:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to initialize cart table",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
