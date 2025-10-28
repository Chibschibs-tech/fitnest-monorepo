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

    // Get subscription statistics
    const stats = await sql`
      SELECT 
        COUNT(*) as total_subscriptions,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_subscriptions,
        COUNT(CASE WHEN status = 'paused' THEN 1 END) as paused_subscriptions,
        COALESCE(SUM(CASE WHEN status = 'active' THEN billing_amount ELSE 0 END), 0) as total_revenue
      FROM active_subscriptions
    `

    // Get detailed subscription data
    const subscriptions = await sql`
      SELECT 
        s.id,
        s.status,
        s.billing_amount,
        s.next_billing_date,
        s.next_delivery_date,
        s.created_at,
        c.first_name,
        c.last_name,
        c.email,
        sp.name as plan_name,
        sp.billing_period
      FROM active_subscriptions s
      JOIN customers c ON s.customer_id = c.id
      JOIN subscription_plans sp ON s.plan_id = sp.id
      ORDER BY s.created_at DESC
      LIMIT 100
    `

    const statsData = stats[0] || {
      total_subscriptions: 0,
      active_subscriptions: 0,
      paused_subscriptions: 0,
      total_revenue: 0,
    }

    return NextResponse.json({
      success: true,
      stats: {
        total: Number.parseInt(statsData.total_subscriptions || "0"),
        active: Number.parseInt(statsData.active_subscriptions || "0"),
        paused: Number.parseInt(statsData.paused_subscriptions || "0"),
        revenue: Number.parseFloat(statsData.total_revenue || "0"),
      },
      subscriptions: subscriptions.map((sub: any) => ({
        ...sub,
        billing_amount: Number.parseFloat(sub.billing_amount || "0"),
        customer_name: `${sub.first_name || ""} ${sub.last_name || ""}`.trim() || "Unknown",
      })),
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
