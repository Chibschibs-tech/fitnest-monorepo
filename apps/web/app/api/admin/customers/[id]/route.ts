export const dynamic = "force-dynamic"
export const revalidate = 0

import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSessionUser } from "@/lib/simple-auth"
import { createErrorResponse, Errors } from "@/lib/error-handler"

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
      return createErrorResponse(authCheck.error, authCheck.error.message, authCheck.error.statusCode)
    }

    const customerId = Number.parseInt(params.id)
    if (isNaN(customerId)) {
      return createErrorResponse(Errors.validation("Invalid customer ID"), "Invalid customer ID", 400)
    }

    // Get customer details
    const customer = await sql`
      SELECT id, name, email, created_at, role
      FROM users 
      WHERE id = ${customerId}
    `

    if (customer.length === 0) {
      return createErrorResponse(Errors.notFound("Customer not found"), "Customer not found", 404)
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
    return createErrorResponse(error, "Failed to fetch customer details", 500)
  }
}
