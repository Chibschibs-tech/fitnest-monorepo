export const dynamic = "force-dynamic"
export const revalidate = 0

import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { createErrorResponse } from "@/lib/error-handler"
import { getSessionUser } from "@/lib/simple-auth"
import { cookies } from "next/headers"

// Helper to check admin auth
async function checkAdminAuth() {
  const cookieStore = cookies()
  const sessionId = cookieStore.get("session-id")?.value
  if (!sessionId) {
    return { error: "Unauthorized", user: null }
  }

  const user = await getSessionUser(sessionId)
  if (!user || user.role !== "admin") {
    return { error: "Forbidden", user: null }
  }

  return { error: null, user }
}

export async function GET() {
  try {
    const authCheck = await checkAdminAuth()
    if (authCheck.error) {
      return NextResponse.json({ error: authCheck.error }, { status: 401 })
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

    // Get all customers (including admin, but we'll filter in the query)
    // Changed to get all users with role 'user' or 'customer', excluding only admin role
    const customers = await sql`
      SELECT 
        id,
        name,
        email,
        phone,
        role,
        COALESCE(status, 'active') as status,
        last_login_at,
        created_at
      FROM users 
      WHERE role IN ('customer', 'user')
      ORDER BY created_at DESC
    `

    // Get order counts for each customer
    const customersWithOrders = await Promise.all(
      customers.map(async (customer) => {
        try {
          const orderCount = await sql`
            SELECT COUNT(*)::int as count 
            FROM orders 
            WHERE user_id = ${customer.id}
          `
          return {
            ...customer,
            orderCount: Number(orderCount[0]?.count || 0),
          }
        } catch (err) {
          // If orders table doesn't exist or query fails, default to 0
          return {
            ...customer,
            orderCount: 0,
          }
        }
      }),
    )

    return NextResponse.json({
      success: true,
      customers: customersWithOrders,
      total: customers.length,
    })
  } catch (error) {
    console.error("Error fetching customers:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch customers"
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authCheck = await checkAdminAuth()
    if (authCheck.error) {
      return NextResponse.json({ error: authCheck.error }, { status: 401 })
    }

    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.email) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing required fields: name and email are required" 
      }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid email format" 
      }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = await sql`SELECT id FROM users WHERE email = ${data.email}`
    if (existingUser.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Email already exists" 
      }, { status: 400 })
    }

    // Generate password if not provided
    let password = data.password
    if (!password || password.trim() === "") {
      // Generate random password
      password = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12)
    }

    // Hash password using simpleHash from simple-auth
    const crypto = await import("crypto")
    const hashedPassword = crypto
      .createHash("sha256")
      .update(password + "fitnest-salt-2024")
      .digest("hex")

    // Set default role if not provided
    const role = data.role || 'customer'
    const validRoles = ['customer', 'user', 'admin']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid role. Must be one of: customer, user, admin" 
      }, { status: 400 })
    }

    // Create customer
    const result = await sql`
      INSERT INTO users (name, email, password, role, status, phone)
      VALUES (${data.name}, ${data.email}, ${hashedPassword}, ${role}, 'active', ${data.phone || null})
      RETURNING id, name, email, phone, role, COALESCE(status, 'active') as status, last_login_at, created_at
    `

    return NextResponse.json({
      success: true,
      customer: result[0],
      generatedPassword: !data.password ? password : undefined,
      message: !data.password ? "Customer created. Temporary password generated." : "Customer created successfully",
    })
  } catch (error) {
    console.error("Error creating customer:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to create customer"
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 })
  }
}
