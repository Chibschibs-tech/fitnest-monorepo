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

export async function GET(request: NextRequest) {
  try {
    const authCheck = await checkAdminAuth(request)
    if (authCheck.error) return authCheck.error

    // Ensure orders table exists
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        total NUMERIC(10,2) NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `
    
    // Ensure order_items table exists
    await sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        meal_id INTEGER REFERENCES meals(id),
        quantity INTEGER DEFAULT 1,
        unit_price NUMERIC(10,2) NOT NULL
      )
    `

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = searchParams.get('limit') ? Number.parseInt(searchParams.get('limit')!) : 100
    
    // Query orders with user information - using correct schema columns
    let orders
    
    if (status) {
      orders = await sql`
        SELECT 
          o.id,
          o.user_id,
          o.total,
          o.status,
          o.created_at,
          o.updated_at,
          u.name as customer_name,
          u.email as customer_email,
          COUNT(oi.id) as item_count
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.status = ${status}
        GROUP BY o.id, u.name, u.email
        ORDER BY o.created_at DESC
        LIMIT ${limit}
      `
    } else {
      orders = await sql`
        SELECT 
          o.id,
          o.user_id,
          o.total,
          o.status,
          o.created_at,
          o.updated_at,
          u.name as customer_name,
          u.email as customer_email,
          COUNT(oi.id) as item_count
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        GROUP BY o.id, u.name, u.email
        ORDER BY o.created_at DESC
        LIMIT ${limit}
      `
    }
    
    return NextResponse.json({
      success: true,
      orders: orders || [],
      count: orders?.length || 0,
    })
  } catch (error) {
    return createErrorResponse(error, "Failed to fetch orders", 500)
  }
}
