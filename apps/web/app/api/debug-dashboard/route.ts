import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql, db } from "@/lib/db"

export const dynamic = "force-dynamic"


export async function GET() {
  try {
    const cookieStore = cookies()
    const sessionId = cookieStore.get("session-id")?.value

    // Get session info
    const sessionResult = await sql`
      SELECT u.id, u.name, u.email, u.role 
      FROM users u
      JOIN sessions s ON u.id = s.user_id
      WHERE s.id = ${sessionId} AND s.expires_at > NOW()
    `

    // Get table structures
    const tables = {}
    const tableNames = ["users", "orders", "meal_plans", "sessions", "express_shop_orders", "delivery_status"]

    for (const tableName of tableNames) {
      try {
        const columns = await sql`
          SELECT column_name as column, data_type as type
          FROM information_schema.columns 
          WHERE table_name = ${tableName} AND table_schema = 'public'
          ORDER BY ordinal_position
        `
        if (columns.length > 0) {
          tables[tableName] = columns
        }
      } catch (error) {
        // Table doesn't exist
      }
    }

    // Get counts
    const counts = {}
    for (const tableName of Object.keys(tables)) {
      try {
        const result = await sql`SELECT COUNT(*) as count FROM ${q(tableName)}`
        counts[tableName] = result[0].count
      } catch (error) {
        counts[tableName] = "error"
      }
    }

    // Get specific user data
    let userData = null
    if (sessionResult.length > 0) {
      const userId = sessionResult[0].id

      // Get ALL orders for this specific user
      const userOrders = await sql`
        SELECT o.*, mp.name as plan_name
        FROM orders o
        LEFT JOIN meal_plans mp ON o.plan_id = mp.id
        WHERE o.user_id = ${userId}
        ORDER BY o.created_at DESC
      `

      // Get all orders to see what users they belong to
      const allOrders = await sql`
        SELECT user_id, COUNT(*) as count
        FROM orders
        GROUP BY user_id
        ORDER BY count DESC
      `

      // Get sample orders from other users to see the structure
      const sampleOrders = await sql`
        SELECT o.*, u.name as user_name, mp.name as plan_name
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN meal_plans mp ON o.plan_id = mp.id
        LIMIT 5
      `

      userData = {
        userId,
        userOrders,
        allOrdersByUser: allOrders,
        sampleOrders,
      }
    }

    return NextResponse.json({
      cookies: Object.fromEntries(cookieStore.getAll().map((c) => [c.name, c.value])),
      sessionId,
      sessionResult,
      tables,
      counts,
      userData,
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
