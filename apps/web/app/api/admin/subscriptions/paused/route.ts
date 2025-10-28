export const dynamic = "force-dynamic";
export const revalidate = 0;

import { type NextRequest, NextResponse } from "next/server"
import { sql, db } from "@/lib/db"
import { getSessionUser } from "@/lib/simple-auth"


export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const sessionId = request.cookies.get("session-id")?.value
    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getSessionUser(sessionId)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Fetch paused subscriptions
    const subscriptions = await sql`
      SELECT 
        o.id,
        o.customer_name,
        o.customer_email,
        o.plan_name,
        o.total_amount,
        o.created_at,
        o.delivery_frequency,
        o.status
      FROM orders o
      WHERE o.status = 'paused'
      ORDER BY o.created_at DESC
    `

    return NextResponse.json({
      success: true,
      subscriptions: subscriptions || [],
    })
  } catch (error) {
    console.error("Error fetching paused subscriptions:", error)
    return NextResponse.json({ error: "Failed to fetch paused subscriptions" }, { status: 500 })
  }
}
