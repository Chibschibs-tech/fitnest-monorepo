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

// GET: Get all meal assignments for a meal plan (all variants)
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authCheck = await checkAdminAuth(request)
    if (authCheck.error) return authCheck.error

    const mealPlanId = Number.parseInt(params.id)
    if (isNaN(mealPlanId)) {
      return createErrorResponse(Errors.validation("Invalid meal plan ID"), "Invalid meal plan ID", 400)
    }

    // Get all assignments grouped by variant
    const assignments = await sql`
      SELECT 
        mpm.id,
        mpm.plan_variant_id,
        mpm.day_index,
        mpm.slot_index,
        mpm.meal_id,
        m.title as meal_title,
        m.meal_type,
        m.image_url as meal_image_url,
        pv.label as variant_label,
        pv.days_per_week,
        pv.meals_per_day
      FROM meal_plan_meals mpm
      JOIN meals m ON mpm.meal_id = m.id
      JOIN plan_variants pv ON mpm.plan_variant_id = pv.id
      WHERE pv.meal_plan_id = ${mealPlanId}
      ORDER BY pv.id, mpm.day_index, mpm.slot_index
    `

    return NextResponse.json({
      success: true,
      assignments: assignments.map((a: any) => ({
        id: a.id,
        plan_variant_id: a.plan_variant_id,
        variant_label: a.variant_label,
        day_index: a.day_index,
        slot_index: a.slot_index,
        meal_id: a.meal_id,
        meal_title: a.meal_title,
        meal_type: a.meal_type,
        meal_image_url: a.meal_image_url,
      })),
    })
  } catch (error) {
    return createErrorResponse(error, "Failed to fetch meal assignments", 500)
  }
}

// POST: Create meal assignment(s) - supports bulk
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authCheck = await checkAdminAuth(request)
    if (authCheck.error) return authCheck.error

    const mealPlanId = Number.parseInt(params.id)
    if (isNaN(mealPlanId)) {
      return createErrorResponse(Errors.validation("Invalid meal plan ID"), "Invalid meal plan ID", 400)
    }

    const body = await request.json()
    const { assignments } = body // Array of { plan_variant_id, day_index, slot_index, meal_id }

    if (!Array.isArray(assignments) || assignments.length === 0) {
      return createErrorResponse(
        Errors.validation("Invalid assignments"),
        "assignments must be a non-empty array",
        400
      )
    }

    // Validate all assignments
    for (const assignment of assignments) {
      const { plan_variant_id, day_index, slot_index, meal_id } = assignment
      if (!plan_variant_id || day_index === undefined || slot_index === undefined || !meal_id) {
        return createErrorResponse(
          Errors.validation("Missing required fields"),
          "Each assignment must have plan_variant_id, day_index, slot_index, and meal_id",
          400
        )
      }

      // Verify variant belongs to this meal plan
      const variantCheck = await sql`
        SELECT id, days_per_week, meals_per_day 
        FROM plan_variants 
        WHERE id = ${plan_variant_id} AND meal_plan_id = ${mealPlanId}
      `
      if (variantCheck.length === 0) {
        return createErrorResponse(
          Errors.notFound("Variant not found"),
          `Variant ${plan_variant_id} does not belong to this meal plan`,
          404
        )
      }

      const variant = variantCheck[0]
      if (day_index < 0 || day_index >= variant.days_per_week) {
        return createErrorResponse(
          Errors.validation("Invalid day_index"),
          `day_index must be between 0 and ${variant.days_per_week - 1}`,
          400
        )
      }

      if (slot_index < 0 || slot_index >= variant.meals_per_day) {
        return createErrorResponse(
          Errors.validation("Invalid slot_index"),
          `slot_index must be between 0 and ${variant.meals_per_day - 1}`,
          400
        )
      }

      // Verify meal exists
      const mealCheck = await sql`SELECT id FROM meals WHERE id = ${meal_id}`
      if (mealCheck.length === 0) {
        return createErrorResponse(Errors.notFound("Meal not found"), `Meal ${meal_id} not found`, 404)
      }
    }

    // Delete existing assignments for these slots (to allow updates)
    const deletePromises = assignments.map((a: any) =>
      sql`
        DELETE FROM meal_plan_meals 
        WHERE plan_variant_id = ${a.plan_variant_id} 
          AND day_index = ${a.day_index} 
          AND slot_index = ${a.slot_index}
      `
    )
    await Promise.all(deletePromises)

    // Insert new assignments
    const insertPromises = assignments.map((a: any) =>
      sql`
        INSERT INTO meal_plan_meals (plan_variant_id, day_index, slot_index, meal_id)
        VALUES (${a.plan_variant_id}, ${a.day_index}, ${a.slot_index}, ${a.meal_id})
        RETURNING id, plan_variant_id, day_index, slot_index, meal_id
      `
    )

    const results = await Promise.all(insertPromises)

    return NextResponse.json({
      success: true,
      assignments: results.map((r) => r[0]),
      message: `Successfully assigned ${results.length} meal(s)`,
    }, { status: 201 })
  } catch (error) {
    return createErrorResponse(error, "Failed to create meal assignments", 500)
  }
}

