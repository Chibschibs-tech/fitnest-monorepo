export const dynamic = "force-dynamic"
export const revalidate = 0

import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authCheck = await checkAdminAuth(request)
    if (authCheck.error) return authCheck.error

    const { status } = await request.json()
    const orderId = Number.parseInt(params.id)

    if (isNaN(orderId)) {
      return createErrorResponse(new Error("Invalid order ID"), "Invalid order ID", 400)
    }

    if (!status || typeof status !== 'string') {
      return createErrorResponse(new Error("Status is required"), "Status is required", 400)
    }

    // Check if order exists
    const existingOrder = await sql`SELECT id FROM orders WHERE id = ${orderId}`
    if (existingOrder.length === 0) {
      return createErrorResponse(new Error("Order not found"), "Order not found", 404)
    }

    // Update order status
    const result = await sql`
      UPDATE orders 
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${orderId}
      RETURNING id, status
    `

    if (result.length === 0) {
      return createErrorResponse(new Error("Failed to update order status"), "Failed to update order status", 500)
    }

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
      order: result[0],
    })
  } catch (error) {
    return createErrorResponse(error, "Failed to update order status", 500)
  }
}
