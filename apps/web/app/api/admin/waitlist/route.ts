export const dynamic = "force-dynamic"
export const revalidate = 0

import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSessionUser } from "@/lib/simple-auth"
import { createErrorResponse, Errors } from "@/lib/error-handler"

// Helper to check admin auth
async function checkAdminAuth(request: NextRequest) {
  const sessionId = request.cookies.get("session-id")?.value
  if (!sessionId) {
    return { error: Errors.unauthorized(), user: null }
  }

  const user = await getSessionUser(sessionId)
  if (!user || user.role !== "admin") {
    return { error: Errors.forbidden(), user: null }
  }

  return { error: null, user }
}

export async function GET(request: NextRequest) {
  try {
    const authCheck = await checkAdminAuth(request)
    if (authCheck.error) {
      return createErrorResponse(authCheck.error, authCheck.error.message, authCheck.error.statusCode)
    }

    // Ensure waitlist table exists
    await sql`
      CREATE TABLE IF NOT EXISTS waitlist (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'waiting'
      )
    `

    // Fetch all waitlist entries
    const waitlist = await sql`
      SELECT id, email, name, created_at, status
      FROM waitlist
      ORDER BY created_at DESC
    `

    return NextResponse.json({
      success: true,
      waitlist: waitlist || [],
    })
  } catch (error) {
    return createErrorResponse(error, "Failed to fetch waitlist", 500)
  }
}
