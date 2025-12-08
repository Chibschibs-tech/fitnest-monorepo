import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getSessionUser } from "@/lib/simple-auth"
import { sql, db } from "@/lib/db"


export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const cookieStore = cookies()
    const sessionId = cookieStore.get("session-id")?.value

    if (!sessionId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const user = await getSessionUser(sessionId)

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    console.log("Fetching admin dashboard data...")

    // Get current date and date 30 days ago
    const now = new Date()
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Initialize default values
    let totalRevenue = 0
    let activeSubscriptions = 0
    let pausedSubscriptions = 0
    let pendingDeliveries = 0
    let todayDeliveries = 0
    let waitlistCount = 0
    let expressShopOrders = 0
    let recentOrders = []
    let popularPlans = []

    try {
      // Get total revenue from both orders (Express Shop) and subscriptions (Meal Plans)
      // Express Shop revenue
      const ordersRevenueResult = await sql`
        SELECT COALESCE(SUM(COALESCE(total_amount, total)), 0) as total
        FROM orders 
        WHERE created_at >= ${thirtyDaysAgo.toISOString()} 
        AND (status IN ('active', 'completed', 'delivered', 'pending') OR status IS NULL)
      `
      const ordersRevenue = Number(ordersRevenueResult[0]?.total) || 0

      // Subscriptions revenue (extract from notes or calculate)
      const subscriptionsRevenueResult = await sql`
        SELECT 
          s.notes,
          pv.weekly_base_price_mad
        FROM subscriptions s
        LEFT JOIN plan_variants pv ON s.plan_variant_id = pv.id
        WHERE s.created_at >= ${thirtyDaysAgo.toISOString()}
        AND s.status = 'active'
      `
      
      let subscriptionsRevenue = 0
      for (const sub of subscriptionsRevenueResult) {
        try {
          const notes = sub.notes ? JSON.parse(sub.notes) : {}
          const totalPrice = notes.total_price || sub.weekly_base_price_mad || 0
          const durationWeeks = notes.duration_weeks || 1
          subscriptionsRevenue += Number(totalPrice) * Number(durationWeeks)
        } catch (e) {
          // If notes parsing fails, use weekly_base_price_mad
          subscriptionsRevenue += Number(sub.weekly_base_price_mad || 0)
        }
      }

      totalRevenue = ordersRevenue + subscriptionsRevenue
    } catch (error) {
      console.log("Revenue query failed:", error)
      totalRevenue = 0
    }

    try {
      // Get active subscriptions count from subscriptions table (NOT orders)
      const activeSubscriptionsResult = await sql`
        SELECT COUNT(*) as count 
        FROM subscriptions 
        WHERE status = 'active'
      `
      activeSubscriptions = Number(activeSubscriptionsResult[0]?.count) || 0
    } catch (error) {
      console.log("Active subscriptions query failed:", error)
    }

    try {
      // Get paused subscriptions count from subscriptions table (NOT orders)
      const pausedSubscriptionsResult = await sql`
        SELECT COUNT(*) as count 
        FROM subscriptions 
        WHERE status = 'paused'
      `
      pausedSubscriptions = Number(pausedSubscriptionsResult[0]?.count) || 0
    } catch (error) {
      console.log("Paused subscriptions query failed:", error)
    }

    try {
      // Get waitlist count
      const waitlistResult = await sql`
        SELECT COUNT(*) as count FROM waitlist
      `
      waitlistCount = Number(waitlistResult[0]?.count) || 0
    } catch (error) {
      console.log("Waitlist query failed:", error)
    }

    try {
      // Get recent orders with user info
      recentOrders = await sql`
        SELECT 
          o.*,
          COALESCE(u.name, o.customer_name, 'Unknown Customer') as customer_name,
          COALESCE(u.email, o.customer_email, 'no-email@example.com') as customer_email,
          COALESCE(o.total_amount, o.total, 0) as total_amount
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC 
        LIMIT 10
      `
    } catch (error) {
      console.log("Recent orders query failed:", error)
      // Try without user join
      try {
        recentOrders = await sql`
          SELECT 
            *,
            COALESCE(customer_name, 'Unknown Customer') as customer_name,
            COALESCE(customer_email, 'no-email@example.com') as customer_email,
            COALESCE(total_amount, total, 0) as total_amount
          FROM orders
          ORDER BY created_at DESC 
          LIMIT 10
        `
      } catch (simpleError) {
        console.log("Simple recent orders query failed:", simpleError)
        recentOrders = []
      }
    }

    try {
      // Get popular plans from subscriptions (meal plans) - count by meal_plan
      const popularPlansResult = await sql`
        SELECT 
          mp.id as plan_id,
          mp.title as plan_name,
          COUNT(s.id) as subscription_count
        FROM subscriptions s
        JOIN plan_variants pv ON s.plan_variant_id = pv.id
        JOIN meal_plans mp ON pv.meal_plan_id = mp.id
        WHERE s.created_at >= ${thirtyDaysAgo.toISOString()}
        GROUP BY mp.id, mp.title
        ORDER BY subscription_count DESC
        LIMIT 4
      `

      popularPlans = popularPlansResult.map((plan: any) => ({
        id: plan.plan_id,
        name: plan.plan_name || `Plan ${plan.plan_id}`,
        count: Number(plan.subscription_count),
      }))

      // If no subscriptions, show all available meal plans with 0 count
      if (popularPlans.length === 0) {
        const allPlans = await sql`
          SELECT id, title 
          FROM meal_plans 
          ORDER BY id 
          LIMIT 4
        `
        popularPlans = allPlans.map((plan: any) => ({
          id: plan.id,
          name: plan.title || `Plan ${plan.id}`,
          count: 0,
        }))
      }
    } catch (error) {
      console.log("Popular plans query failed:", error)
      // Fallback: try to get meal plans directly
      try {
        const allPlans = await sql`
          SELECT id, title 
          FROM meal_plans 
          ORDER BY id 
          LIMIT 4
        `
        popularPlans = allPlans.map((plan: any) => ({
          id: plan.id,
          name: plan.title || `Plan ${plan.id}`,
          count: 0,
        }))
      } catch (fallbackError) {
        console.log("Fallback popular plans query failed:", fallbackError)
        popularPlans = []
      }
    }

    try {
      // Get pending deliveries from deliveries table
      const pendingDeliveriesResult = await sql`
        SELECT COUNT(*) as count 
        FROM deliveries 
        WHERE status IN ('pending', 'scheduled', 'preparing', 'out_for_delivery')
      `
      pendingDeliveries = Number(pendingDeliveriesResult[0]?.count) || 0
    } catch (error) {
      console.log("Pending deliveries query failed:", error)
      // Fallback: count from recent orders
      pendingDeliveries = recentOrders.filter(
        (order) => order.status === "active" || order.status === "processing" || !order.status,
      ).length
    }

    try {
      // Get today's deliveries
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const todayDeliveriesResult = await sql`
        SELECT COUNT(*) as count 
        FROM deliveries 
        WHERE delivery_date >= ${today.toISOString()}
        AND delivery_date < ${tomorrow.toISOString()}
      `
      todayDeliveries = Number(todayDeliveriesResult[0]?.count) || 0
    } catch (error) {
      console.log("Today deliveries query failed:", error)
      // Fallback: count from recent orders
      todayDeliveries = recentOrders.filter((order) => {
        const orderDate = new Date(order.created_at)
        const today = new Date()
        return orderDate.toDateString() === today.toDateString()
      }).length
    }

    try {
      // Get Express Shop orders count (orders that are NOT subscriptions)
      // Express Shop orders are in the orders table but don't have a subscription relationship
      const expressShopOrdersResult = await sql`
        SELECT COUNT(*) as count 
        FROM orders o
        WHERE o.created_at >= ${thirtyDaysAgo.toISOString()}
        AND NOT EXISTS (
          SELECT 1 FROM subscriptions s 
          WHERE s.user_id = o.user_id 
          AND s.starts_at::date = o.created_at::date
        )
      `
      expressShopOrders = Number(expressShopOrdersResult[0]?.count) || 0
    } catch (error) {
      console.log("Express Shop orders query failed:", error)
      expressShopOrders = 0
    }

    console.log(
      `Dashboard stats: Revenue: ${totalRevenue}, Active: ${activeSubscriptions}, Recent Orders: ${recentOrders.length}`,
    )

    return NextResponse.json({
      totalRevenue,
      activeSubscriptions,
      pausedSubscriptions,
      pendingDeliveries,
      todayDeliveries,
      waitlistCount,
      expressShopOrders,
      recentOrders,
      popularPlans,
    })
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error)
    return NextResponse.json(
      {
        message: "Something went wrong",
        error: error instanceof Error ? error.message : "Unknown error",
        // Return empty data instead of failing
        totalRevenue: 0,
        activeSubscriptions: 0,
        pausedSubscriptions: 0,
        pendingDeliveries: 0,
        todayDeliveries: 0,
        waitlistCount: 0,
        expressShopOrders: 0,
        recentOrders: [],
        popularPlans: [],
      },
      { status: 200 }, // Return 200 instead of 500 to avoid breaking the UI
    )
  }
}
