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
    const { status } = data

    // Validate status
    const validStatuses = ['active', 'inactive', 'suspended']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ 
        success: false, 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      }, { status: 400 })
    }

    // Check if customer exists
    const existingCustomer = await sql`SELECT id, role FROM users WHERE id = ${customerId}`
    if (existingCustomer.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Customer not found" 
      }, { status: 404 })
    }

    // Prevent changing status of admin users
    if (existingCustomer[0].role === 'admin') {
      return NextResponse.json({ 
        success: false, 
        error: "Cannot change status of admin users" 
      }, { status: 400 })
    }

    // Update status
    // First ensure the column exists
    try {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'`
    } catch (err) {
      // Column might already exist, ignore error
    }

    const result = await sql`
      UPDATE users 
      SET status = ${status}
      WHERE id = ${customerId}
      RETURNING id, name, email, role, status, created_at
    `

    if (result.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Failed to update customer status" 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      customer: result[0],
      message: `Customer status updated to ${status}`,
    })
  } catch (error) {
    console.error("Error updating customer status:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to update customer status"
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 })
  }
}




