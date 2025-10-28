import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql, db } from "@/lib/db"

export const dynamic = "force-dynamic"


/**
 * GET /api/user/dashboard
 * Returns dashboard data including subscriptions, orders, and stats
 */
export async function GET() {
  try {
    console.log("=== Dashboard API Called ===")

    const cookieStore = cookies()
    const sessionId = cookieStore.get("session-id")?.value

    console.log("Session ID:", sessionId)

    if (!sessionId) {
      return NextResponse.json({ error: "No session found" }, { status: 401 })
    }

    // Get user from session
    const sessionResult = await sql`
      SELECT u.id, u.name, u.email, u.role 
      FROM users u
      JOIN sessions s ON u.id = s.user_id
      WHERE s.id = ${sessionId} AND s.expires_at > NOW()
    `

    console.log("Session query result:", sessionResult)

    if (sessionResult.length === 0) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const user = sessionResult[0]
    console.log("Found user:", user)

    // Initialize payload
    const payload = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      activeSubscriptions: [],
      orderHistory: [],
      expressShopOrders: [],
      upcomingDeliveries: [],
      stats: {
        totalOrders: 0,
        totalExpressShopOrders: 0,
        totalExpressShopSpent: 0,
      },
    }

    // Get ALL orders for this user first to see what exists
    console.log("=== Querying Orders ===")

    try {
      const allUserOrders = await sql`
        SELECT * FROM orders WHERE user_id = ${user.id}
      `
      console.log("Raw orders for user:", allUserOrders)

      // Get orders with meal plan details
      const ordersWithPlans = await sql`
        SELECT 
          o.id, 
          o.user_id, 
          o.status, 
          o.plan_id,
          o.total_amount, 
          o.created_at,
          o.delivery_date,
          o.delivery_frequency,
          o.delivery_days,
          mp.name as plan_name,
          mp.weekly_price
        FROM orders o
        LEFT JOIN meal_plans mp ON o.plan_id = mp.id
        WHERE o.user_id = ${user.id}
        ORDER BY o.created_at DESC
      `

      console.log("Orders with meal plans:", ordersWithPlans)

      payload.orderHistory = ordersWithPlans
      payload.stats.totalOrders = ordersWithPlans.length

      // Filter active subscriptions
      const activeStatuses = ["active", "paused", "confirmed", "pending"]
      payload.activeSubscriptions = ordersWithPlans.filter((order) => {
        const status = (order.status || "").toLowerCase()
        const isActive = activeStatuses.includes(status)
        console.log(`Order ${order.id} status: ${order.status} -> isActive: ${isActive}`)
        return isActive
      })

      console.log("Active subscriptions found:", payload.activeSubscriptions)
    } catch (error) {
      console.error("Error fetching orders:", error)
    }

    // Check for express shop orders
    console.log("=== Checking Express Shop Orders ===")
    try {
      const expressShopOrders = await sql`
        SELECT 
          id, 
          user_id,
          total_amount, 
          status, 
          created_at
        FROM express_shop_orders
        WHERE user_id = ${user.id}
        ORDER BY created_at DESC
        LIMIT 10
      `

      console.log("Express shop orders:", expressShopOrders)

      payload.expressShopOrders = expressShopOrders.map((order) => ({
        ...order,
        order_type: "express_shop",
      }))

      payload.stats.totalExpressShopOrders = expressShopOrders.length
      payload.stats.totalExpressShopSpent = expressShopOrders.reduce((sum, order) => {
        const amount = Number(order.total_amount || 0)
        return sum + (amount >= 1000 ? amount / 100 : amount)
      }, 0)
    } catch (error) {
      console.error("Express shop orders table doesn't exist or error:", error)
    }

    // Check for upcoming deliveries
    console.log("=== Checking Upcoming Deliveries ===")
    try {
      const upcomingDeliveries = await sql`
        SELECT 
          ds.delivery_date,
          ds.status,
          ds.order_id,
          o.id as order_id
        FROM delivery_status ds
        JOIN orders o ON ds.order_id = o.id
        WHERE o.user_id = ${user.id}
        AND ds.status = 'pending'
        AND ds.delivery_date >= CURRENT_DATE
        ORDER BY ds.delivery_date ASC
        LIMIT 5
      `

      console.log("Upcoming deliveries:", upcomingDeliveries)
      payload.upcomingDeliveries = upcomingDeliveries
    } catch (error) {
      console.error("Delivery status table doesn't exist or error:", error)
    }

    console.log("=== Final Payload ===")
    console.log(JSON.stringify(payload, null, 2))

    return NextResponse.json({
      status: "success",
      data: payload,
      ...payload,
    })
  } catch (error) {
    console.error("Dashboard API error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
