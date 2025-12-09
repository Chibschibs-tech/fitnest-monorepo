import { type NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getSessionUser } from '@/lib/simple-auth'
import { createErrorResponse } from '@/lib/error-handler'

export const dynamic = "force-dynamic"
export const revalidate = 0

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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authCheck = await checkAdminAuth(request)
    if (authCheck.error) return authCheck.error

    const orderId = Number.parseInt(params.id)
    
    if (isNaN(orderId)) {
      return createErrorResponse(new Error("Invalid order ID"), "Invalid order ID", 400)
    }
    
    // Get order with user info and order items
    const order = await sql`
      SELECT 
        o.id,
        o.user_id,
        o.total,
        o.status,
        o.created_at,
        o.updated_at,
        u.name as customer_name,
        u.email as customer_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ${orderId}
      LIMIT 1
    `
    
    if (order.length === 0) {
      return createErrorResponse(new Error("Order not found"), "Order not found", 404)
    }

    // Get order items
    const orderItems = await sql`
      SELECT 
        oi.id,
        oi.product_id,
        oi.meal_id,
        oi.quantity,
        oi.unit_price,
        p.name as product_name,
        m.name as meal_name
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      LEFT JOIN meals m ON oi.meal_id = m.id
      WHERE oi.order_id = ${orderId}
    `
    
    return NextResponse.json({
      success: true,
      order: {
        ...order[0],
        items: orderItems || [],
      },
    })
  } catch (error) {
    return createErrorResponse(error, "Failed to fetch order", 500)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authCheck = await checkAdminAuth(request)
    if (authCheck.error) return authCheck.error

    const body = await request.json()
    const orderId = Number.parseInt(params.id)
    
    if (isNaN(orderId)) {
      return createErrorResponse(new Error("Invalid order ID"), "Invalid order ID", 400)
    }
    
    // Check if order exists
    const existingOrder = await sql`SELECT id FROM orders WHERE id = ${orderId}`
    if (existingOrder.length === 0) {
      return createErrorResponse(new Error("Order not found"), "Order not found", 404)
    }
    
    // Build update query - only update fields that exist in schema
    const updateFields: string[] = []
    const values: any[] = []
    let paramCounter = 1

    if (body.status !== undefined) {
      updateFields.push(`status = $${paramCounter++}`)
      values.push(body.status)
    }
    if (body.total !== undefined) {
      updateFields.push(`total = $${paramCounter++}`)
      values.push(Number(body.total))
    }
    if (body.user_id !== undefined) {
      updateFields.push(`user_id = $${paramCounter++}`)
      values.push(body.user_id ? Number(body.user_id) : null)
    }

    if (updateFields.length === 0) {
      return createErrorResponse(new Error("No fields to update"), "No fields to update", 400)
    }

    updateFields.push(`updated_at = NOW()`)
    values.push(orderId) // Add ID for WHERE clause

    const query = `
      UPDATE orders 
      SET ${updateFields.join(", ")} 
      WHERE id = $${paramCounter}
      RETURNING id, user_id, total, status, created_at, updated_at
    `

    const { q } = await import("@/lib/db")
    const result = await q(query, values)
    
    if (result.length === 0) {
      return createErrorResponse(new Error("Failed to update order"), "Failed to update order", 500)
    }
    
    return NextResponse.json({
      success: true,
      order: result[0],
    })
  } catch (error) {
    return createErrorResponse(error, "Failed to update order", 500)
  }
}
