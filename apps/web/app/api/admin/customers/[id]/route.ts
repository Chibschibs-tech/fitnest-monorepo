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

    // Ensure all Phase 2 columns exist
    try {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'`
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20)`
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_notes TEXT`
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP`
    } catch (err) {
      // Columns might already exist, ignore error
    }

    const customer = await sql`
      SELECT 
        id, 
        name, 
        email, 
        phone,
        created_at, 
        role, 
        COALESCE(status, 'active') as status,
        admin_notes,
        last_login_at
      FROM users 
      WHERE id = ${customerId}
    `

    if (customer.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Customer not found" 
      }, { status: 404 })
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
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch customer details"
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const data = await request.json()

    // Check if customer exists
    const existingCustomer = await sql`SELECT id, email FROM users WHERE id = ${customerId}`
    if (existingCustomer.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Customer not found" 
      }, { status: 404 })
    }

    // Validate email if being updated
    if (data.email && data.email !== existingCustomer[0].email) {
      // Check if new email already exists
      const emailExists = await sql`SELECT id FROM users WHERE email = ${data.email} AND id != ${customerId}`
      if (emailExists.length > 0) {
        return NextResponse.json({ 
          success: false, 
          error: "Email already exists" 
        }, { status: 400 })
      }
    }

    // Build update query dynamically
    const updateFields: string[] = []
    const values: any[] = []
    let paramCounter = 1

    if (data.name !== undefined) {
      updateFields.push(`name = $${paramCounter++}`)
      values.push(data.name)
    }
    if (data.email !== undefined) {
      updateFields.push(`email = $${paramCounter++}`)
      values.push(data.email)
    }
    if (data.role !== undefined) {
      // Validate role
      const validRoles = ['customer', 'user', 'admin']
      if (!validRoles.includes(data.role)) {
        return NextResponse.json({ 
          success: false, 
          error: "Invalid role. Must be one of: customer, user, admin" 
        }, { status: 400 })
      }
      updateFields.push(`role = $${paramCounter++}`)
      values.push(data.role)
    }
    if (data.password !== undefined && data.password.trim() !== "") {
      // Hash password using simpleHash from simple-auth
      const crypto = await import("crypto")
      const hashedPassword = crypto
        .createHash("sha256")
        .update(data.password + "fitnest-salt-2024")
        .digest("hex")
      updateFields.push(`password = $${paramCounter++}`)
      values.push(hashedPassword)
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "No fields to update" 
      }, { status: 400 })
    }

    values.push(customerId) // Add ID for WHERE clause

    // Use q() helper for parameterized queries
    const { q } = await import("@/lib/db")
    const query = `
      UPDATE users 
      SET ${updateFields.join(", ")} 
      WHERE id = $${paramCounter}
      RETURNING id, name, email, role, created_at
    `

    const result = await q(query, values)

    if (result.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Failed to update customer" 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      customer: result[0],
    })
  } catch (error) {
    console.error("Error updating customer:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to update customer"
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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
    const existingCustomer = await sql`SELECT id, email FROM users WHERE id = ${customerId}`
    if (existingCustomer.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Customer not found" 
      }, { status: 404 })
    }

    // Prevent deleting admin users
    const customer = await sql`SELECT role FROM users WHERE id = ${customerId}`
    if (customer[0]?.role === 'admin') {
      return NextResponse.json({ 
        success: false, 
        error: "Cannot delete admin users" 
      }, { status: 400 })
    }

    // Check for active orders or subscriptions
    const activeOrders = await sql`
      SELECT COUNT(*)::int as count 
      FROM orders 
      WHERE user_id = ${customerId} AND status IN ('pending', 'processing', 'active')
    `
    const hasActiveOrders = Number(activeOrders[0]?.count || 0) > 0

    // For now, we'll do a hard delete, but in production you might want soft delete
    // Option 1: Hard delete (current implementation)
    await sql`DELETE FROM users WHERE id = ${customerId}`

    // Option 2: Soft delete (uncomment if preferred)
    // await sql`UPDATE users SET role = 'deleted' WHERE id = ${customerId}`

    return NextResponse.json({
      success: true,
      message: "Customer deleted successfully",
      warning: hasActiveOrders ? "Customer had active orders" : undefined,
    })
  } catch (error) {
    console.error("Error deleting customer:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to delete customer"
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 })
  }
}
