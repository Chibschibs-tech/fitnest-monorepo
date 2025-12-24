import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export const dynamic = "force-dynamic"

/**
 * Check waitlist entries in database
 * This endpoint helps verify that submissions are being saved
 */
export async function GET() {
  try {
    // Get recent waitlist entries
    const entries = await sql`
      SELECT 
        id,
        first_name,
        last_name,
        email,
        phone,
        preferred_meal_plan,
        city,
        position,
        status,
        created_at
      FROM waitlist
      ORDER BY created_at DESC
      LIMIT 10
    `

    // Get total count
    const countResult = await sql`SELECT COUNT(*) as total FROM waitlist`
    const total = countResult[0]?.total || 0

    return NextResponse.json({
      success: true,
      totalEntries: total,
      recentEntries: entries,
      message: "Waitlist database check successful",
    })
  } catch (error) {
    console.error("Error checking waitlist database:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: "Failed to check waitlist database",
      },
      { status: 500 }
    )
  }
}

