export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"

export async function GET() {
  try {

    // Check what cart-related tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%cart%'
    `

    const tableStructures: any = {}

    // Get structure for each cart table
    for (const table of tables) {
      const columns = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = ${table.table_name}
        ORDER BY ordinal_position
      `
      tableStructures[table.table_name] = columns
    }

    // Also check if there are any cart records
    const sampleData: any = {}
    for (const table of tables) {
      try {
        const sample = await sql`SELECT * FROM ${q(table.table_name)} LIMIT 3`
        sampleData[table.table_name] = sample
      } catch (e) {
        sampleData[table.table_name] = "Error reading table"
      }
    }

    return NextResponse.json({
      status: "success",
      cartTables: tables.map((t) => t.table_name),
      tableStructures,
      sampleData,
    })
  } catch (error) {
    return NextResponse.json({
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
