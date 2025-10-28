import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/simple-auth"
import { sql, db } from "@/lib/db"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"


export async function GET() {
  try {
    // Check authentication
    const cookieStore = cookies()
    const sessionId = cookieStore.get("session-id")?.value

    if (!sessionId) {
      return NextResponse.json({ error: "No session found" }, { status: 401 })
    }

    const user = await getSessionUser(sessionId)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Check if waitlist table exists
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'waitlist'
    `

    if (tables.length === 0) {
      return NextResponse.json({
        error: "Waitlist table does not exist",
        tableExists: false,
      })
    }

    // Get table structure
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
      LIMIT 10
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
    })
  } catch (error) {
    console.error("Database debug error:", error)
    return NextResponse.json(
      {
        error: "Database debug failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
