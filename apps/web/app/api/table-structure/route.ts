export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"

export async function GET() {
  try {
    // Initialize the Neon SQL client

    // Get the table structure
    const tableStructure = await sql`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'products'
      ORDER BY ordinal_position
    `

    // Get a sample row to see the actual data
    const sampleData = await sql`
      SELECT *
      FROM products
      LIMIT 1
    `

    return NextResponse.json({
      tableStructure,
      sampleData: sampleData.length > 0 ? sampleData[0] : null,
      columnNames: tableStructure.map((col) => col.column_name),
    })
  } catch (error) {
    console.error("Error fetching table structure:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch table structure",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
