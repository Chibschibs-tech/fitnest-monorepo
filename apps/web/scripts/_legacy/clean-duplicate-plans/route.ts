import { type NextRequest, NextResponse } from "next/server"
import { sql, db } from "@/lib/db"
import { getSessionUser } from "@/lib/simple-auth"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("session-id")?.value
    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getSessionUser(sessionId)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Find duplicate plans (same name)
    const duplicates = await sql`
      SELECT name, COUNT(*) as count, array_agg(id ORDER BY created_at) as ids
      FROM subscription_plans 
      GROUP BY name 
      HAVING COUNT(*) > 1
    `

    let deletedCount = 0

    for (const duplicate of duplicates) {
      // Keep the first one (oldest), delete the rest
      const idsToDelete = duplicate.ids.slice(1)

      for (const id of idsToDelete) {
        // Delete plan items first
        await sql`DELETE FROM subscription_plan_items WHERE plan_id = ${id}`

        // Delete the plan
        await sql`DELETE FROM subscription_plans WHERE id = ${id}`
        deletedCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned ${deletedCount} duplicate plans`,
      duplicatesFound: duplicates.length,
      deletedCount,
    })
  } catch (error) {
    console.error("Clean duplicate plans error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
