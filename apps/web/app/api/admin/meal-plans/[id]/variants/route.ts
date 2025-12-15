export const dynamic = "force-dynamic"
export const revalidate = 0

import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSessionUser } from "@/lib/simple-auth"

// Helper to check admin auth
async function checkAdminAuth(request: NextRequest) {
  const sessionId = request.cookies.get("session-id")?.value
  if (!sessionId) {
    return { error: { message: "Unauthorized", statusCode: 401 }, user: null }
  }

  const user = await getSessionUser(sessionId)
  if (!user || user.role !== "admin") {
    return { error: { message: "Forbidden", statusCode: 403 }, user: null }
  }

  return { error: null, user }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authCheck = await checkAdminAuth(request)
    if (authCheck.error) {
      return NextResponse.json({ 
        success: false, 
        error: authCheck.error.message || "Unauthorized" 
      }, { status: authCheck.error.statusCode || 401 })
    }

    const mealPlanId = Number.parseInt(params.id)
    if (isNaN(mealPlanId)) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid meal plan ID" 
      }, { status: 400 })
    }

    // Get plan variants for this meal plan
    const variants = await sql`
      SELECT 
        pv.id,
        pv.label,
        pv.days_per_week,
        pv.meals_per_day,
        pv.weekly_price_mad as weekly_base_price_mad,
        pv.published,
        mp.title as meal_plan_title
      FROM plan_variants pv
      JOIN meal_plans mp ON pv.meal_plan_id = mp.id
      WHERE pv.meal_plan_id = ${mealPlanId}
        AND pv.published = true
      ORDER BY pv.days_per_week, pv.meals_per_day
    `

    return NextResponse.json({
      success: true,
      variants: variants.map((v: any) => ({
        id: v.id,
        label: v.label,
        days_per_week: v.days_per_week,
        meals_per_day: v.meals_per_day,
        weekly_base_price_mad: Number(v.weekly_price_mad || 0),
        meal_plan_title: v.meal_plan_title,
      })),
    })
  } catch (error) {
    console.error("Error fetching plan variants:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch plan variants"
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 })
  }
}

