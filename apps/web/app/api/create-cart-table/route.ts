export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"

export async function GET() {
  try {

    // Create cart table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS cart (
        id VARCHAR(255) NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id, product_id),
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `

    // Check if table was created successfully
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'cart'
    `

    return NextResponse.json({
      success: true,
      message: "Cart table created successfully",
      tableExists: tables.length > 0,
    })
  } catch (error) {
    console.error("Error creating cart table:", error)
    return NextResponse.json(
      {
        error: "Failed to create cart table",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
