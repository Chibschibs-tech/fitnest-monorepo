import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)

    // Check if waitlist table exists
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'waitlist'
    `

    if (tables.length === 0) {
      return NextResponse.json({
        error: "Waitlist table does not exist",
        suggestion: "Create the waitlist table first",
      })
    }

    // Get waitlist table structure
    const structure = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'waitlist'
      ORDER BY ordinal_position
    `

    // Get sample data
    const sampleData = await sql`
      SELECT * FROM waitlist 
      ORDER BY created_at DESC 
      LIMIT 5
    `

    // Get total count
    const totalCount = await sql`
      SELECT COUNT(*) as count FROM waitlist
    `

    return NextResponse.json({
      status: "success",
      tableExists: true,
      structure,
      sampleData,
      totalCount: totalCount[0]?.count || 0,
      requestUrl: url.toString(),
    })
  } catch (error) {
    console.error("Waitlist debug error:", error)
    return NextResponse.json({
      error: "Debug failed",
      details: error instanceof Error ? error.message : String(error),
    })
  }
}
