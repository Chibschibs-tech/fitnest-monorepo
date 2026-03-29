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

    const body = await request.json()
    const { status, paymentStatus } = body
    const orderId = Number.parseInt(params.id)

    if (isNaN(orderId)) {
      return createErrorResponse(new Error("Invalid order ID"), "Invalid order ID", 400)
    }

    if (!status && !paymentStatus) {
      return createErrorResponse(new Error("Provide status or paymentStatus"), "Provide status or paymentStatus", 400)
    }

    const existingOrder = await sql`SELECT id FROM orders WHERE id = ${orderId}`
    if (existingOrder.length === 0) {
      return createErrorResponse(new Error("Order not found"), "Order not found", 404)
    }

    if (status && paymentStatus) {
      const result = await sql`
        UPDATE orders SET status = ${status}, payment_status = ${paymentStatus}, updated_at = NOW()
        WHERE id = ${orderId} RETURNING id, status, payment_method, payment_status
      `
      return NextResponse.json({ success: true, order: result[0] })
    } else if (paymentStatus) {
      const result = await sql`
        UPDATE orders SET payment_status = ${paymentStatus}, updated_at = NOW()
        WHERE id = ${orderId} RETURNING id, status, payment_method, payment_status
      `
      return NextResponse.json({ success: true, order: result[0] })
    } else {
      const result = await sql`
        UPDATE orders SET status = ${status}, updated_at = NOW()
        WHERE id = ${orderId} RETURNING id, status, payment_method, payment_status
      `
      return NextResponse.json({ success: true, order: result[0] })
    }
  } catch (error) {
    return createErrorResponse(error, "Failed to update order status", 500)
  }
}
