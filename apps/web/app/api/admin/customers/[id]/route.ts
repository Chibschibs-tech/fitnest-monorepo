export const dynamic = "force-dynamic";
export const revalidate = 0;

import { type NextRequest, NextResponse } from "next/server"
import { sql, db } from "@/lib/db"
import { getSessionUser } from "@/lib/simple-auth"


export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionId = request.cookies.get("session-id")?.value
    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getSessionUser(sessionId)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const customerId = params.id

    // Get customer details
    const customer = await sql`
      SELECT id, name, email, created_at, role
      FROM users 
      WHERE id = ${customerId}
    `

    if (customer.length === 0) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    // Get customer orders
    const orders = await sql`
      SELECT 
        id,
        total,
        status,
        created_at
      FROM orders 
      WHERE user_id = ${customerId}
      ORDER BY created_at DESC
    `

    // Calculate stats
    const totalOrders = orders.length
    const totalSpent = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0)
    const activeOrders = orders.filter((order) => order.status === "active" || order.status === "pending").length

    return NextResponse.json({
      success: true,
      customer: {
        ...customer[0],
        totalOrders,
        totalSpent,
        activeOrders,
        orders: orders,
      },
    })
  } catch (error) {
    console.error("Error fetching customer details:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch customer details",
      },
      { status: 500 },
    )
  }
}
