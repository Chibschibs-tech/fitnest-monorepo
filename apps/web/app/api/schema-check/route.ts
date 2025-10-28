import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {

    // Check if products table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'products'
      ) as exists
    `

    if (!tableExists[0].exists) {
      return NextResponse.json({
        success: false,
        message: "Products table does not exist",
        tables: await getTableList(sql),
      })
    }

    // Get column information
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'products'
      ORDER BY ordinal_position
    `

    // Get sample data
    const sampleData = await sql`
      SELECT * FROM products LIMIT 1
    `

    return NextResponse.json({
      success: true,
      message: "Schema check completed",
      tableExists: tableExists[0].exists,
      columns: columns,
      sampleData: sampleData.length > 0 ? sampleData[0] : null,
      tables: await getTableList(sql),
    })
  } catch (error) {
    console.error("Schema check error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check schema",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

async function getTableList(sql) {
  const tables = await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `
  return tables.map((t) => t.table_name)
}
