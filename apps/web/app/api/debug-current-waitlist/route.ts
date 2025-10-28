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

    // Get current waitlist data
    const waitlistData = await sql`
      SELECT * FROM waitlist 
      ORDER BY created_at DESC
      LIMIT 50
    `

    // Get waitlist statistics
    const stats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as last_24h,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as last_7d,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as last_30d
      FROM waitlist
    `

    return NextResponse.json({
      status: "success",
      data: waitlistData,
      stats: stats[0],
      count: waitlistData.length,
    })
  } catch (error) {
    console.error("Current waitlist debug error:", error)
    return NextResponse.json(
      {
        error: "Failed to get current waitlist data",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
