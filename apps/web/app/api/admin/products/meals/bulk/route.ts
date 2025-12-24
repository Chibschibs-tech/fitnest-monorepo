import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSessionUser } from "@/lib/simple-auth"
import { cookies } from "next/headers"
import { createErrorResponse, Errors } from "@/lib/error-handler"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const sessionId = cookieStore.get("session-id")?.value

    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getSessionUser(sessionId)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { action, ids } = body

    if (!action || !Array.isArray(ids) || ids.length === 0) {
      return createErrorResponse(
        Errors.validation("Invalid request"),
        "action and ids array are required",
        400
      )
    }

    const mealIds = ids.map((id) => Number.parseInt(String(id))).filter((id) => !isNaN(id))

    if (mealIds.length === 0) {
      return createErrorResponse(
        Errors.validation("Invalid IDs"),
        "No valid meal IDs provided",
        400
      )
    }

    let result
    let message = ""

    switch (action) {
      case "publish":
        result = await sql`
          UPDATE meals 
          SET published = true 
          WHERE id = ANY(${mealIds}::int[])
          RETURNING id
        `
        message = `Published ${result.length} meal(s)`
        break

      case "unpublish":
        result = await sql`
          UPDATE meals 
          SET published = false 
          WHERE id = ANY(${mealIds}::int[])
          RETURNING id
        `
        message = `Unpublished ${result.length} meal(s)`
        break

      case "delete":
        // Check if any meals are used in meal plans
        const usedMeals = await sql`
          SELECT DISTINCT meal_id 
          FROM meal_plan_meals 
          WHERE meal_id = ANY(${mealIds}::int[])
        `
        const usedIds = usedMeals.map((m: any) => m.meal_id)

        // Soft delete (unpublish) meals used in plans
        if (usedIds.length > 0) {
          await sql`
            UPDATE meals 
            SET published = false 
            WHERE id = ANY(${usedIds}::int[])
          `
        }

        // Hard delete meals not used in plans
        const deleteIds = mealIds.filter((id) => !usedIds.includes(id))
        if (deleteIds.length > 0) {
          await sql`
            DELETE FROM meals 
            WHERE id = ANY(${deleteIds}::int[])
          `
        }

        const total = mealIds.length
        const softDeleted = usedIds.length
        const hardDeleted = deleteIds.length
        message = `Deleted ${total} meal(s): ${hardDeleted} permanently deleted, ${softDeleted} unpublished (used in meal plans)`
        break

      default:
        return createErrorResponse(
          Errors.validation("Invalid action"),
          "Action must be 'publish', 'unpublish', or 'delete'",
          400
        )
    }

    return NextResponse.json({
      success: true,
      message,
      affected: mealIds.length,
    })
  } catch (error) {
    console.error("Error in bulk operation:", error)
    return createErrorResponse(error, "Failed to perform bulk operation", 500)
  }
}




