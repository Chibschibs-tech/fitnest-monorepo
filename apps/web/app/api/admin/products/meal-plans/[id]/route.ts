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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authCheck = await checkAdminAuth(request)
    if (authCheck.error) return authCheck.error

    const mealPlanId = Number.parseInt(params.id)
    if (isNaN(mealPlanId)) {
      return createErrorResponse(Errors.validation("Invalid meal plan ID"), "Invalid meal plan ID", 400)
    }

    const result = await sql`
      SELECT 
        mp.id,
        mp.slug,
        mp.title as name,
        mp.summary as description,
        mp.audience as category,
        mp.published as is_active,
        mp.created_at,
        COALESCE(MIN(pv.weekly_base_price_mad), 0) as price_per_week,
        COALESCE(COUNT(DISTINCT pv.id), 0) as variant_count,
        COALESCE(COUNT(DISTINCT s.id), 0) as subscribers_count
      FROM meal_plans mp
      LEFT JOIN plan_variants pv ON mp.id = pv.meal_plan_id
      LEFT JOIN subscriptions s ON pv.id = s.plan_variant_id AND s.status = 'active'
      WHERE mp.id = ${mealPlanId}
      GROUP BY mp.id, mp.slug, mp.title, mp.summary, mp.audience, mp.published, mp.created_at
    `

    if (result.length === 0) {
      return createErrorResponse(Errors.notFound("Meal plan not found"), "Meal plan not found", 404)
    }

    const plan = result[0]

    return NextResponse.json({
      success: true,
      mealPlan: {
        id: plan.id,
        name: plan.name,
        description: plan.description || '',
        price_per_week: Number(plan.price_per_week) || 0,
        category: plan.category || 'balanced',
        is_available: plan.is_active,
        subscribers_count: Number(plan.subscribers_count) || 0,
        variant_count: Number(plan.variant_count) || 0,
        created_at: plan.created_at,
      },
    })
  } catch (error) {
    return createErrorResponse(error, "Failed to fetch meal plan", 500)
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authCheck = await checkAdminAuth(request)
    if (authCheck.error) return authCheck.error

    const mealPlanId = Number.parseInt(params.id)
    if (isNaN(mealPlanId)) {
      return createErrorResponse(Errors.validation("Invalid meal plan ID"), "Invalid meal plan ID", 400)
    }

    const body = await request.json()
    const { name, description, category, is_available } = body

    // Check if meal plan exists
    const existing = await sql`SELECT id FROM meal_plans WHERE id = ${mealPlanId}`
    if (existing.length === 0) {
      return createErrorResponse(Errors.notFound("Meal plan not found"), "Meal plan not found", 404)
    }

    // Build update query dynamically
    const updateFields: string[] = []
    const values: any[] = []
    let paramCounter = 1

    if (name !== undefined) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      updateFields.push(`title = $${paramCounter++}`)
      values.push(name)
      updateFields.push(`slug = $${paramCounter++}`)
      values.push(slug)
    }
    if (description !== undefined) {
      updateFields.push(`summary = $${paramCounter++}`)
      values.push(description)
    }
    if (category !== undefined) {
      updateFields.push(`audience = $${paramCounter++}`)
      values.push(category)
    }
    if (is_available !== undefined) {
      updateFields.push(`published = $${paramCounter++}`)
      values.push(is_available)
    }

    if (updateFields.length === 0) {
      return createErrorResponse(Errors.validation("No fields to update"), "No fields to update", 400)
    }

    values.push(mealPlanId)

    // Use q() helper for parameterized queries
    const { q } = await import("@/lib/db")
    const result = await q(
      `UPDATE meal_plans SET ${updateFields.join(', ')} WHERE id = $${paramCounter} RETURNING id, slug, title, summary, audience, published, created_at`,
      values
    )

    return NextResponse.json({
      success: true,
      mealPlan: {
        id: result[0].id,
        name: result[0].title,
        description: result[0].summary || '',
        category: result[0].audience,
        is_available: result[0].published,
        created_at: result[0].created_at,
      },
    })
  } catch (error) {
    return createErrorResponse(error, "Failed to update meal plan", 500)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authCheck = await checkAdminAuth(request)
    if (authCheck.error) return authCheck.error

    const mealPlanId = Number.parseInt(params.id)
    if (isNaN(mealPlanId)) {
      return createErrorResponse(Errors.validation("Invalid meal plan ID"), "Invalid meal plan ID", 400)
    }

    // Check if meal plan exists
    const existing = await sql`SELECT id FROM meal_plans WHERE id = ${mealPlanId}`
    if (existing.length === 0) {
      return createErrorResponse(Errors.notFound("Meal plan not found"), "Meal plan not found", 404)
    }

    // Check if there are active subscriptions using this plan
    const activeSubscriptions = await sql`
      SELECT COUNT(*) as count
      FROM subscriptions s
      JOIN plan_variants pv ON s.plan_variant_id = pv.id
      WHERE pv.meal_plan_id = ${mealPlanId} AND s.status = 'active'
    `

    if (Number(activeSubscriptions[0]?.count || 0) > 0) {
      // Soft delete: just unpublish instead of deleting
      await sql`
        UPDATE meal_plans 
        SET published = false
        WHERE id = ${mealPlanId}
      `
      return NextResponse.json({
        success: true,
        message: "Meal plan unpublished (has active subscriptions)",
      })
    }

    // Hard delete if no active subscriptions
    await sql`DELETE FROM meal_plans WHERE id = ${mealPlanId}`

    return NextResponse.json({
      success: true,
      message: "Meal plan deleted successfully",
    })
  } catch (error) {
    return createErrorResponse(error, "Failed to delete meal plan", 500)
  }
}

