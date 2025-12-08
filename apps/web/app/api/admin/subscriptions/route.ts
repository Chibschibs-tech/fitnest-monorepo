export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"
import { getSessionUser } from "@/lib/simple-auth"


export async function GET(request: Request) {
  try {
    const sessionId = request.cookies.get("session-id")?.value
    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getSessionUser(sessionId)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get subscription statistics from subscriptions table
    const stats = await sql`
      SELECT 
        COUNT(*) as total_subscriptions,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_subscriptions,
        COUNT(CASE WHEN status = 'paused' THEN 1 END) as paused_subscriptions,
        COUNT(CASE WHEN status = 'canceled' THEN 1 END) as canceled_subscriptions,
        COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_subscriptions
      FROM subscriptions
    `

    // Get detailed subscription data with user and plan information
    const subscriptionsData = await sql`
      SELECT 
        s.id,
        s.status,
        s.starts_at,
        s.renews_at,
        s.notes,
        s.created_at,
        u.id as user_id,
        u.name as customer_name,
        u.email,
        pv.id as plan_variant_id,
        pv.label as plan_variant_label,
        pv.days_per_week,
        pv.meals_per_day,
        pv.weekly_base_price_mad,
        mp.id as meal_plan_id,
        mp.title as plan_name,
        mp.audience
      FROM subscriptions s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN plan_variants pv ON s.plan_variant_id = pv.id
      LEFT JOIN meal_plans mp ON pv.meal_plan_id = mp.id
      ORDER BY s.created_at DESC
      LIMIT 100
    `

    // Process subscriptions to extract billing info from notes
    const subscriptions = subscriptionsData.map((sub: any) => {
      let notesData = {}
      try {
        notesData = sub.notes ? JSON.parse(sub.notes) : {}
      } catch (e) {
        console.error("Error parsing subscription notes:", e)
      }

      // Extract billing info from notes or calculate from plan variant
      const totalPrice = notesData.total_price || sub.weekly_base_price_mad || 0
      const durationWeeks = notesData.duration_weeks || 1
      const billingAmount = Number(totalPrice) * Number(durationWeeks)

      // Calculate next delivery date (start date + 1 day for first delivery)
      const startsAt = sub.starts_at ? new Date(sub.starts_at) : new Date()
      const nextDeliveryDate = new Date(startsAt)
      nextDeliveryDate.setDate(nextDeliveryDate.getDate() + 1)

      // Calculate next billing date (renews_at or start + duration)
      const nextBillingDate = sub.renews_at 
        ? new Date(sub.renews_at) 
        : (notesData.duration_weeks 
          ? new Date(new Date(startsAt).setDate(startsAt.getDate() + (notesData.duration_weeks * 7)))
          : null)

      return {
        id: sub.id,
        status: sub.status,
        billing_amount: billingAmount,
        next_billing_date: nextBillingDate?.toISOString().split('T')[0] || null,
        next_delivery_date: nextDeliveryDate.toISOString().split('T')[0],
        created_at: sub.created_at,
        customer_name: sub.customer_name || "Unknown",
        email: sub.email || "no-email@example.com",
        plan_name: sub.plan_name || sub.plan_variant_label || "Unknown Plan",
        billing_period: notesData.duration_weeks ? `${notesData.duration_weeks} weeks` : "weekly",
        // Additional info from notes
        meal_types: notesData.meal_types || [],
        days_per_week: notesData.days_per_week || sub.days_per_week || 5,
        duration_weeks: notesData.duration_weeks || durationWeeks,
        payment_status: notesData.payment_status || "pending",
      }
    })

    // Calculate total revenue from active subscriptions
    const activeSubscriptions = subscriptions.filter((s: any) => s.status === "active")
    const totalRevenue = activeSubscriptions.reduce((sum: number, sub: any) => sum + (sub.billing_amount || 0), 0)

    const statsData = stats[0] || {
      total_subscriptions: 0,
      active_subscriptions: 0,
      paused_subscriptions: 0,
      canceled_subscriptions: 0,
      expired_subscriptions: 0,
    }

    return NextResponse.json({
      success: true,
      stats: {
        total: Number.parseInt(statsData.total_subscriptions || "0"),
        active: Number.parseInt(statsData.active_subscriptions || "0"),
        paused: Number.parseInt(statsData.paused_subscriptions || "0"),
        canceled: Number.parseInt(statsData.canceled_subscriptions || "0"),
        expired: Number.parseInt(statsData.expired_subscriptions || "0"),
        revenue: totalRevenue,
      },
      subscriptions: subscriptions,
    })
  } catch (error) {
    console.error("Error fetching subscriptions:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch subscriptions",
        stats: { total: 0, active: 0, paused: 0, revenue: 0 },
        subscriptions: [],
      },
      { status: 500 },
    )
  }
}
