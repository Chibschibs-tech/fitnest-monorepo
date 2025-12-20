import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSessionUser } from "@/lib/simple-auth"
import { createErrorResponse, Errors } from "@/lib/error-handler"

export const dynamic = "force-dynamic"
export const revalidate = 0

// Helper to check admin auth
async function checkAdminAuth(request: NextRequest) {
  const sessionId = request.cookies.get("session-id")?.value
  if (!sessionId) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), user: null }
  }

  const user = await getSessionUser(sessionId)
  if (!user || user.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), user: null }
  }

  return { error: null, user }
}

// PUT: Update a meal assignment
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; assignmentId: string } }
) {
  try {
    const authCheck = await checkAdminAuth(request)
    if (authCheck.error) return authCheck.error

    const mealPlanId = Number.parseInt(params.id)
    const assignmentId = Number.parseInt(params.assignmentId)

    if (isNaN(mealPlanId) || isNaN(assignmentId)) {
      return createErrorResponse(Errors.validation("Invalid IDs"), "Invalid meal plan or assignment ID", 400)
    }

    const body = await request.json()
    const { meal_id, day_index, slot_index } = body

    // Verify assignment exists and belongs to this meal plan
    const existing = await sql`
      SELECT mpm.*, pv.meal_plan_id
      FROM meal_plan_meals mpm
      JOIN plan_variants pv ON mpm.plan_variant_id = pv.id
      WHERE mpm.id = ${assignmentId} AND pv.meal_plan_id = ${mealPlanId}
    `

    if (existing.length === 0) {
      return createErrorResponse(Errors.notFound("Assignment not found"), "Assignment not found", 404)
    }

    const assignment = existing[0]

    // Build update query
    const updates: string[] = []
    const values: any[] = []
    let paramCounter = 1

    if (meal_id !== undefined) {
      // Verify meal exists
      const mealCheck = await sql`SELECT id FROM meals WHERE id = ${meal_id}`
      if (mealCheck.length === 0) {
        return createErrorResponse(Errors.notFound("Meal not found"), "Meal not found", 404)
      }
      updates.push(`meal_id = $${paramCounter++}`)
      values.push(meal_id)
    }

    if (day_index !== undefined) {
      // Verify day_index is valid for the variant
      const variant = await sql`
        SELECT days_per_week FROM plan_variants WHERE id = ${assignment.plan_variant_id}
      `
      if (variant.length > 0 && (day_index < 0 || day_index >= variant[0].days_per_week)) {
        return createErrorResponse(
          Errors.validation("Invalid day_index"),
          `day_index must be between 0 and ${variant[0].days_per_week - 1}`,
          400
        )
      }
      updates.push(`day_index = $${paramCounter++}`)
      values.push(day_index)
    }

    if (slot_index !== undefined) {
      // Verify slot_index is valid for the variant
      const variant = await sql`
        SELECT meals_per_day FROM plan_variants WHERE id = ${assignment.plan_variant_id}
      `
      if (variant.length > 0 && (slot_index < 0 || slot_index >= variant[0].meals_per_day)) {
        return createErrorResponse(
          Errors.validation("Invalid slot_index"),
          `slot_index must be between 0 and ${variant[0].meals_per_day - 1}`,
          400
        )
      }
      updates.push(`slot_index = $${paramCounter++}`)
      values.push(slot_index)
    }

    if (updates.length === 0) {
      return createErrorResponse(Errors.validation("No fields to update"), "No fields to update", 400)
    }

    values.push(assignmentId)

    const { q } = await import("@/lib/db")
    const result = await q(
      `UPDATE meal_plan_meals SET ${updates.join(", ")} WHERE id = $${paramCounter} RETURNING *`,
      values
    )

    return NextResponse.json({
      success: true,
      assignment: result[0],
    })
  } catch (error) {
    return createErrorResponse(error, "Failed to update meal assignment", 500)
  }
}

// DELETE: Delete a meal assignment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; assignmentId: string } }
) {
  try {
    const authCheck = await checkAdminAuth(request)
    if (authCheck.error) return authCheck.error

    const mealPlanId = Number.parseInt(params.id)
    const assignmentId = Number.parseInt(params.assignmentId)

    if (isNaN(mealPlanId) || isNaN(assignmentId)) {
      return createErrorResponse(Errors.validation("Invalid IDs"), "Invalid meal plan or assignment ID", 400)
    }

    // Verify assignment exists and belongs to this meal plan
    const existing = await sql`
      SELECT mpm.id, pv.meal_plan_id
      FROM meal_plan_meals mpm
      JOIN plan_variants pv ON mpm.plan_variant_id = pv.id
      WHERE mpm.id = ${assignmentId} AND pv.meal_plan_id = ${mealPlanId}
    `

    if (existing.length === 0) {
      return createErrorResponse(Errors.notFound("Assignment not found"), "Assignment not found", 404)
    }

    await sql`DELETE FROM meal_plan_meals WHERE id = ${assignmentId}`

    return NextResponse.json({
      success: true,
      message: "Meal assignment deleted successfully",
    })
  } catch (error) {
    return createErrorResponse(error, "Failed to delete meal assignment", 500)
  }
}

