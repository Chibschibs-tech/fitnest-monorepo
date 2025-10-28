import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"


export async function GET() {
  try {
    const cookieStore = cookies()
    const sessionId = cookieStore.get("session-id")?.value

    // Check if sessions table exists and what's in it
    const sessions = await sql`
      SELECT s.id, s.user_id, s.expires_at, s.created_at, u.email, u.role
      FROM sessions s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.id = ${sessionId}
    `

    // Also get all sessions for debugging (limit to recent ones)
    const allSessions = await sql`
      SELECT s.id, s.user_id, s.expires_at, s.created_at, u.email, u.role
      FROM sessions s
      LEFT JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
      LIMIT 10
    `

    return NextResponse.json({
      currentSessionId: sessionId,
      currentSession: sessions[0] || null,
      recentSessions: allSessions,
      sessionExists: sessions.length > 0,
      sessionExpired: sessions[0] ? new Date(sessions[0].expires_at) < new Date() : null,
    })
  } catch (error) {
    console.error("Error checking sessions:", error)
    return NextResponse.json({
      error: "Database error",
      details: error.message,
      currentSessionId: cookieStore?.get("session-id")?.value || "none",
    })
  }
}
