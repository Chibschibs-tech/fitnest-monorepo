export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"

export async function GET() {
  try {

    // Get all tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `

    // Get schema for each table
    const schema = {}

    for (const table of tables) {
      const tableName = table.table_name

      const columns = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = ${tableName}
      `

      schema[tableName] = columns
    }

    // Get sample data from products table
    let productSample = []
    try {
      productSample = await sql`SELECT * FROM products LIMIT 1`
    } catch (error) {
      console.error("Error fetching product sample:", error)
    }

    return NextResponse.json({
      tables: tables.map((t) => t.table_name),
      schema,
      productSample,
    })
  } catch (error) {
    console.error("Error fetching database schema:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch database schema",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
