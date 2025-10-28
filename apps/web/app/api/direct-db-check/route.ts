import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {

    // Check database connection
    const connectionTest = await sql`SELECT 1 as connection_test`

    // Get list of tables
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `

    // Check if products table exists
    const productsTableExists = tables.some((t) => t.table_name === "products")

    let productsColumns = []
    let sampleProduct = null
    let productCount = 0

    if (productsTableExists) {
      // Get columns for products table
      productsColumns = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'products'
        ORDER BY ordinal_position
      `

      // Get a sample product
      const sampleProducts = await sql`
        SELECT * FROM products LIMIT 1
      `

      if (sampleProducts.length > 0) {
        sampleProduct = sampleProducts[0]
      }

      // Get product count
      const countResult = await sql`
        SELECT COUNT(*) as count FROM products
      `

      productCount = Number.parseInt(countResult[0].count)
    }

    // Try a direct query with the correct column names
    let directQueryResult = null
    let directQueryError = null

    if (productsTableExists) {
      try {
        // Use a raw query that adapts to the column names
        const columnNames = productsColumns.map((c) => c.column_name)

        const query = `
          SELECT 
            id, 
            name, 
            description, 
            price
            ${columnNames.includes("saleprice") ? ", saleprice" : ""}
            ${columnNames.includes("imageurl") ? ", imageurl" : ""}
            ${columnNames.includes("category") ? ", category" : ""}
          FROM products
          LIMIT 3
        `

        const result = await q(query)
        directQueryResult = result.rows
      } catch (err) {
        directQueryError = err instanceof Error ? err.message : String(err)
      }
    }

    return NextResponse.json({
      success: true,
      connectionTest: connectionTest[0],
      tables: tables.map((t) => t.table_name),
      productsTableExists,
      productsColumns,
      sampleProduct,
      productCount,
      directQueryResult,
      directQueryError,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Direct DB check error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check database",
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
