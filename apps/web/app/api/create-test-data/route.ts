import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql, db } from "@/lib/db"

export const dynamic = "force-dynamic"


export async function POST() {
  try {
    const cookieStore = cookies()
    const sessionId = cookieStore.get("session-id")?.value

    if (!sessionId) {
      return NextResponse.json({ error: "No session found" }, { status: 401 })
    }

    // Get user from session
    const sessionResult = await sql`
      SELECT u.id, u.name, u.email 
      FROM users u
      JOIN sessions s ON u.id = s.user_id
      WHERE s.id = ${sessionId} AND s.expires_at > NOW()
    `

    if (sessionResult.length === 0) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const user = sessionResult[0]

    // Get available meal plans
    const mealPlans = await sql`
      SELECT id, name, weekly_price 
      FROM meal_plans 
      WHERE is_active = true 
      LIMIT 3
    `

    if (mealPlans.length === 0) {
      return NextResponse.json({ error: "No meal plans available" }, { status: 400 })
    }

    // Create test orders for this user
    const testOrders = []

    for (let i = 0; i < 3; i++) {
      const plan = mealPlans[i % mealPlans.length]
      const statuses = ["active", "completed", "pending"]
      const status = statuses[i]

      const order = await sql`
        INSERT INTO orders (
          user_id, 
          plan_id, 
          status, 
          total_amount, 
          delivery_address,
          delivery_date,
          created_at,
          delivery_frequency,
          delivery_days
        ) VALUES (
          ${user.id},
          ${plan.id},
          ${status}::order_status,
          ${Math.floor(plan.weekly_price * 100)},
          'Test Address, Casablanca, Morocco',
          ${new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString()},
          ${new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()},
          'weekly',
          '["Monday", "Wednesday", "Friday"]'
        )
        RETURNING *
      `

      testOrders.push(order[0])

      // Create delivery schedules for active orders
      if (status === "active") {
        const deliveryDates = []
        for (let week = 0; week < 4; week++) {
          const baseDate = new Date()
          baseDate.setDate(baseDate.getDate() + week * 7)

          // Monday, Wednesday, Friday
          const days = [1, 3, 5]
          days.forEach((day) => {
            const deliveryDate = new Date(baseDate)
            deliveryDate.setDate(deliveryDate.getDate() + day)
            deliveryDates.push(deliveryDate.toISOString().split("T")[0])
          })
        }

        // Insert delivery schedules
        for (const deliveryDate of deliveryDates) {
          await sql`
            INSERT INTO delivery_status (order_id, delivery_date, status)
            VALUES (${order[0].id}, ${deliveryDate}, 'pending')
            ON CONFLICT (order_id, delivery_date) DO NOTHING
          `
        }
      }
    }

    return NextResponse.json({
      message: `Created ${testOrders.length} test orders for user ${user.name}`,
      orders: testOrders,
    })
  } catch (error) {
    console.error("Error creating test data:", error)
    return NextResponse.json(
      {
        error: "Failed to create test data",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
