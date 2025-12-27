import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Get all tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `

    const audit: any = {
      success: true,
      timestamp: new Date().toISOString(),
      tables: tables.map((t: any) => t.table_name),
      tableDetails: {} as any,
    }

    // For each table, get row count and sample data structure
    for (const table of tables) {
      const tableName = table.table_name

      try {
        // Get row count - use dynamic SQL construction
        const countQuery = `SELECT COUNT(*) as count FROM "${tableName}"`
        const countResult = await (sql as any).query(countQuery)
        const count = countResult.rows?.[0]?.count || countResult[0]?.count || 0

        // Get column structure
        const columns = await sql`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns
          WHERE table_name = ${tableName}
          ORDER BY ordinal_position
        `

        // Get sample data (first 3 rows)
        let sampleData: any[] = []
        if (parseInt(count.toString()) > 0) {
          try {
            const sampleQuery = `SELECT * FROM "${tableName}" LIMIT 3`
            const sampleResult = await (sql as any).query(sampleQuery)
            sampleData = sampleResult.rows || sampleResult || []
          } catch (e) {
            // Some tables might not be queryable
            sampleData = []
          }
        }

        audit.tableDetails[tableName] = {
          rowCount: parseInt(count.toString()),
          columns: columns.map((c: any) => ({
            name: c.column_name,
            type: c.data_type,
            nullable: c.is_nullable === 'YES',
            default: c.column_default,
          })),
          sampleData: sampleData,
        }
      } catch (error: any) {
        audit.tableDetails[tableName] = {
          error: error.message,
        }
      }
    }

    // Specifically check for meal plans and pricing tables
    const keyTables = [
      'meal_plans',
      'meals',
      'mp_categories',
      'meal_type_prices',
      'discount_rules',
      'products',
      'subscriptions',
      'orders',
      'users',
    ]

    const keyTableData: any = {}
    for (const tableName of keyTables) {
      if (audit.tables.includes(tableName)) {
        try {
          const query = `SELECT * FROM "${tableName}" LIMIT 10`
          const result = await (sql as any).query(query)
          keyTableData[tableName] = result.rows || result || []
        } catch (e: any) {
          keyTableData[tableName] = { error: e.message }
        }
      }
    }

    audit.keyTableData = keyTableData

    return NextResponse.json(audit, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    )
  }
}

