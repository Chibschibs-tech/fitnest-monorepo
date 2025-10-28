export const dynamic = "force-dynamic";
export const revalidate = 0;

import { type NextRequest, NextResponse } from "next/server"
import { sql, db } from "@/lib/db"
import { getSessionUser } from "@/lib/simple-auth"


export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const sessionId = request.cookies.get("session-id")?.value
    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getSessionUser(sessionId)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    console.log("Running database diagnostic...")

    const diagnostic = {
      timestamp: new Date().toISOString(),
      tables: {} as Record<string, any>,
    }

    // Get all table names
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `

    // For each table, get structure and sample data
    for (const table of tables) {
      const tableName = table.table_name
      try {
        // Get table structure
        const columns = await sql`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = ${tableName}
          ORDER BY ordinal_position
        `

        // Get row count
        const countResult = await sql`
          SELECT COUNT(*) as count FROM ${q(tableName)}
        `
        const rowCount = Number(countResult[0].count)

        // Get sample data (first 5 rows)
        let sampleData = []
        if (rowCount > 0) {
          sampleData = await sql`
            SELECT * FROM ${q(tableName)} 
            ORDER BY 
              CASE 
                WHEN ${tableName} = 'users' THEN created_at
                WHEN ${tableName} = 'waitlist' THEN created_at
                WHEN ${tableName} = 'orders' THEN created_at
                ELSE 1
              END DESC
            LIMIT 5
          `
        }

        diagnostic.tables[tableName] = {
          structure: columns,
          rowCount,
          sampleData,
        }
      } catch (error) {
        console.error(`Error processing table ${tableName}:`, error)
        diagnostic.tables[tableName] = {
          error: error instanceof Error ? error.message : "Unknown error",
        }
      }
    }

    return NextResponse.json({
      success: true,
      diagnostic,
    })
  } catch (error) {
    console.error("Error running database diagnostic:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to run database diagnostic",
      },
      { status: 500 },
    )
  }
}
