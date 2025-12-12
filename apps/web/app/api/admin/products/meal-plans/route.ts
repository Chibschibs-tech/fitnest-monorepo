export const dynamic = "force-dynamic";
export const revalidate = 0;

import { type NextRequest, NextResponse } from "next/server"
import { sql } from '@/lib/db'
import { getSessionUser } from "@/lib/simple-auth"
import { createErrorResponse } from "@/lib/error-handler"

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

export async function GET(request: NextRequest) {
  try {
    const authCheck = await checkAdminAuth(request)
    if (authCheck.error) return authCheck.error

    // Use correct meal_plans schema from Drizzle
    // Join with plan_variants to get pricing info
    const mealPlansResult = await sql`
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
      GROUP BY mp.id, mp.slug, mp.title, mp.summary, mp.audience, mp.published, mp.created_at
      ORDER BY mp.created_at DESC
    `

    // Format response to match frontend expectations
    const mealPlans = mealPlansResult.map((plan: any) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description || '',
      price_per_week: Number(plan.price_per_week) || 0,
      duration_weeks: 4, // Default, can be customized per variant
      meals_per_day: 3, // Default, can be customized per variant
      category: plan.category || 'balanced',
      image_url: null, // Can be added later
      is_available: plan.is_active,
      subscribers_count: Number(plan.subscribers_count) || 0,
      variant_count: Number(plan.variant_count) || 0,
      created_at: plan.created_at,
    }))

    return NextResponse.json({
      success: true,
      mealPlans: mealPlans,
      total: mealPlans.length,
    })
  } catch (error) {
    return createErrorResponse(error, "Failed to fetch meal plans", 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const authCheck = await checkAdminAuth(request)
    if (authCheck.error) return authCheck.error

    const body = await request.json()
    const { name, description, category, published = false } = body

    // Validate required fields
    if (!name || !category) {
      return createErrorResponse(
        new Error("Missing required fields"),
        "Missing required fields: name and category are required",
        400
      )
    }

    // Generate slug from title
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Insert new meal plan using correct schema
    const result = await sql`
      INSERT INTO meal_plans (slug, title, summary, audience, published)
      VALUES (${slug}, ${name}, ${description || null}, ${category}, ${published})
      RETURNING id, slug, title, summary, audience, published, created_at
    `

    const newMealPlan = result[0]

    return NextResponse.json({
      success: true,
      mealPlan: {
        id: newMealPlan.id,
        name: newMealPlan.title,
        description: newMealPlan.summary || '',
        category: newMealPlan.audience,
        is_available: newMealPlan.published,
        price_per_week: 0, // Pricing is in plan_variants
        subscribers_count: 0,
        variant_count: 0,
        created_at: newMealPlan.created_at,
      },
    }, { status: 201 })
  } catch (error) {
    return createErrorResponse(error, "Failed to create meal plan", 500)
  }
}
