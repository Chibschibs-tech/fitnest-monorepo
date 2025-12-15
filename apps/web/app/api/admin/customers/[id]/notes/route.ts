export const dynamic = "force-dynamic"
export const revalidate = 0

import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSessionUser } from "@/lib/simple-auth"
import { Errors } from "@/lib/error-handler"

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
    const { notes } = data

    // Ensure admin_notes column exists
    try {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_notes TEXT`
    } catch (err) {
      // Column might already exist, ignore error
    }

    // Check if customer exists
    const existingCustomer = await sql`SELECT id FROM users WHERE id = ${customerId}`
    if (existingCustomer.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Customer not found" 
      }, { status: 404 })
    }

    // Update admin notes
    const result = await sql`
      UPDATE users 
      SET admin_notes = ${notes || null}
      WHERE id = ${customerId}
      RETURNING id, name, email, admin_notes
    `

    if (result.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Failed to update admin notes" 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      customer: result[0],
      message: "Admin notes updated successfully",
    })
  } catch (error) {
    console.error("Error updating admin notes:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to update admin notes"
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 })
  }
}




