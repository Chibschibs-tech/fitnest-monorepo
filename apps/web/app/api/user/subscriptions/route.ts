import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getSessionUser } from "@/lib/simple-auth"
import { sql } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const cookieStore = cookies()
    const sessionId = cookieStore.get("session-id")?.value

    if (!sessionId) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const user = await getSessionUser(sessionId)
    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid session" }, { status: 401 })
    }

    let tableExists = false
    try {
      await sql`SELECT 1 FROM orders LIMIT 1`
      tableExists = true
    } catch {
      console.log("Orders table doesn't exist yet")
    }

    if (!tableExists) {
      return NextResponse.json({ success: true, subscriptions: [] })
    }

    const orders = await sql`
      SELECT 
        id,
        plan_id as "planId",
        plan_name as "planName",
        status,
        created_at as "createdAt",
        total_amount as "totalAmount"
      FROM orders 
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
    `

    return NextResponse.json({ success: true, subscriptions: orders })
  } catch (error) {
    console.error("Error fetching subscriptions:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch subscriptions", subscriptions: [] },
      { status: 500 },
    )
  }
}
