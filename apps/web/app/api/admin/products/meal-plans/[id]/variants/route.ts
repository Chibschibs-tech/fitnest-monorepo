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
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), user: null }
  }

  const user = await getSessionUser(sessionId)
  if (!user || user.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), user: null }
  }

  return { error: null, user }
}

// GET: List all variants for a meal plan
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authCheck = await checkAdminAuth(request)
    if (authCheck.error) return authCheck.error

    const mealPlanId = Number.parseInt(params.id)
    if (isNaN(mealPlanId)) {
      return createErrorResponse(Errors.validation("Invalid meal plan ID"), "Invalid meal plan ID", 400)
    }

    const variants = await sql`
      SELECT 
        pv.id,
        pv.label,
        pv.days_per_week,
        pv.meals_per_day,
        pv.weekly_price_mad,
        pv.published,
        mp.title as meal_plan_title
      FROM plan_variants pv
      JOIN meal_plans mp ON pv.meal_plan_id = mp.id
      WHERE pv.meal_plan_id = ${mealPlanId}
      ORDER BY pv.days_per_week, pv.meals_per_day
    `

    return NextResponse.json({
      success: true,
      variants: variants.map((v: any) => ({
        id: v.id,
        label: v.label,
        days_per_week: v.days_per_week,
        meals_per_day: v.meals_per_day,
        weekly_price_mad: Number(v.weekly_price_mad || 0),
        published: v.published,
        meal_plan_title: v.meal_plan_title,
      })),
    })
  } catch (error) {
    return createErrorResponse(error, "Failed to fetch plan variants", 500)
  }
}

// POST: Create a new variant for a meal plan
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authCheck = await checkAdminAuth(request)
    if (authCheck.error) return authCheck.error

    const mealPlanId = Number.parseInt(params.id)
    if (isNaN(mealPlanId)) {
      return createErrorResponse(Errors.validation("Invalid meal plan ID"), "Invalid meal plan ID", 400)
    }

    // Verify meal plan exists
    const mealPlanCheck = await sql`SELECT id FROM meal_plans WHERE id = ${mealPlanId}`
    if (mealPlanCheck.length === 0) {
      return createErrorResponse(Errors.notFound("Meal plan not found"), "Meal plan not found", 404)
    }

    const body = await request.json()
    const { label, days_per_week, meals_per_day, weekly_price_mad, published = true } = body

    // Validate required fields
    if (!label || days_per_week === undefined || meals_per_day === undefined || weekly_price_mad === undefined) {
      return createErrorResponse(
        Errors.validation("Missing required fields"),
        "Missing required fields: label, days_per_week, meals_per_day, weekly_price_mad",
        400
      )
    }

    // Validate values
    if (days_per_week < 1 || days_per_week > 7) {
      return createErrorResponse(
        Errors.validation("Invalid days_per_week"),
        "days_per_week must be between 1 and 7",
        400
      )
    }

    if (meals_per_day < 1 || meals_per_day > 5) {
      return createErrorResponse(
        Errors.validation("Invalid meals_per_day"),
        "meals_per_day must be between 1 and 5",
        400
      )
    }

    if (weekly_price_mad < 0) {
      return createErrorResponse(
        Errors.validation("Invalid price"),
        "weekly_price_mad must be positive",
        400
      )
    }

    // Insert new variant
    const result = await sql`
      INSERT INTO plan_variants (meal_plan_id, label, days_per_week, meals_per_day, weekly_price_mad, published)
      VALUES (${mealPlanId}, ${label}, ${days_per_week}, ${meals_per_day}, ${weekly_price_mad}, ${published})
      RETURNING id, meal_plan_id, label, days_per_week, meals_per_day, weekly_price_mad, published
    `

    return NextResponse.json({
      success: true,
      variant: {
        id: result[0].id,
        meal_plan_id: result[0].meal_plan_id,
        label: result[0].label,
        days_per_week: result[0].days_per_week,
        meals_per_day: result[0].meals_per_day,
        weekly_price_mad: Number(result[0].weekly_price_mad || 0),
        published: result[0].published,
      },
    }, { status: 201 })
  } catch (error) {
    return createErrorResponse(error, "Failed to create plan variant", 500)
  }
}





