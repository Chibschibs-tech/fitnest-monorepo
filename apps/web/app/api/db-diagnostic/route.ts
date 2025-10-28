import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {

    // Test database connection
    const connectionTest = await sql`SELECT 1 as connection_test`

    // Get all tables
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `

    // Check if products table exists
    const productsTableExists = tables.some((t) => t.table_name === "products")

    let productsColumns = []
    let productCount = 0

    if (productsTableExists) {
      // Get columns for products table
      productsColumns = await sql`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'products'
        ORDER BY ordinal_position
      `

      // Count products
      const countResult = await sql`SELECT COUNT(*) as count FROM products`
      productCount = Number.parseInt(countResult[0].count)
    }

    return NextResponse.json({
      success: true,
      connectionTest: connectionTest[0],
      databaseUrl: process.env.DATABASE_URL ? "Set (masked)" : "Not set",
      tables: tables.map((t) => t.table_name),
      productsTable: {
        exists: productsTableExists,
        columns: productsColumns,
        recordCount: productCount,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Database diagnostic error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
