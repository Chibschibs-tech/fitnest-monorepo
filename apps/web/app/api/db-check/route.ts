import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"

// Force dynamic to prevent caching issues
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    console.log("DB check API called")

    // Test the connection with a simple query
    const result = await sql`SELECT NOW() as time`

    // Check if products table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'products'
      ) as exists
    `

    // If table exists, count products
    let productCount = 0
    if (tableExists[0].exists) {
      const countResult = await sql`SELECT COUNT(*) as count FROM products`
      productCount = Number.parseInt(countResult[0].count)
    }

    return NextResponse.json({
      success: true,
      time: result[0].time,
      database: {
        connected: true,
        productsTableExists: tableExists[0].exists,
        productCount,
      },
    })
  } catch (error) {
    console.error("Database connection error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to connect to database",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
