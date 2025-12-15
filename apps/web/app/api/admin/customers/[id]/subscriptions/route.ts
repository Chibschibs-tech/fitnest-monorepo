export const dynamic = "force-dynamic"
export const revalidate = 0

import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSessionUser } from "@/lib/simple-auth"
import { Errors } from "@/lib/error-handler"

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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authCheck = await checkAdminAuth(request)
    if (authCheck.error) {
      return NextResponse.json({ 
        success: false, 
        error: authCheck.error.message || "Unauthorized" 
      }, { status: authCheck.error.statusCode || 401 })
    }

    const customerId = Number.parseInt(params.id)
    if (isNaN(customerId)) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid customer ID. Customer ID must be a number." 
      }, { status: 400 })
    }

    // Check if customer exists
    const customer = await sql`SELECT id FROM users WHERE id = ${customerId}`
    if (customer.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Customer not found" 
      }, { status: 404 })
    }

    // Get all subscriptions for this customer
    // Join with plan_variants and meal_plans to get plan details
    const subscriptions = await sql`
      SELECT 
        s.id,
        s.user_id,
        s.plan_variant_id,
        s.status,
        s.starts_at,
        s.renews_at,
        s.notes,
        pv.label as plan_variant_label,
        pv.weekly_price_mad as weekly_base_price_mad,
        pv.days_per_week,
        pv.meals_per_day,
        mp.title as meal_plan_title,
        mp.slug as meal_plan_slug
      FROM subscriptions s
      LEFT JOIN plan_variants pv ON s.plan_variant_id = pv.id
      LEFT JOIN meal_plans mp ON pv.meal_plan_id = mp.id
      WHERE s.user_id = ${customerId}
      ORDER BY s.starts_at DESC
    `

    // Separate active, paused, and canceled subscriptions
    const active = subscriptions.filter((sub) => sub.status === "active")
    const paused = subscriptions.filter((sub) => sub.status === "paused")
    const canceled = subscriptions.filter((sub) => sub.status === "canceled" || sub.status === "expired")

    return NextResponse.json({
      success: true,
      subscriptions: subscriptions,
      active: active,
      paused: paused,
      canceled: canceled,
      total: subscriptions.length,
    })
  } catch (error) {
    console.error("Error fetching customer subscriptions:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch customer subscriptions"
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 })
  }
}

