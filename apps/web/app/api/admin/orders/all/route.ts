export const dynamic = "force-dynamic";
export const revalidate = 0;

import { type NextRequest, NextResponse } from "next/server"
import { sql, db } from "@/lib/db"


export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("session-id")?.value
    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Fetching all orders...")

    let orders = []

    try {
      // Try to get orders with user information
      orders = await sql`
        SELECT 
          o.id,
          COALESCE(u.name, o.customer_name, 'Guest Customer') as customer_name,
          COALESCE(u.email, o.customer_email, 'guest@example.com') as customer_email,
          COALESCE(mp.name, 'Custom Plan') as plan_name,
          COALESCE(
            CASE 
              WHEN o.total IS NOT NULL THEN o.total
              WHEN o.total_amount IS NOT NULL THEN o.total_amount
              ELSE 0
            END, 
            0
          ) as total_amount,
          COALESCE(o.status, 'pending') as status,
          o.created_at,
          COALESCE(o.delivery_frequency, 'weekly') as delivery_frequency,
          COALESCE(o.duration_weeks, 1) as duration_weeks
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN meal_plans mp ON o.meal_plan_id = mp.id
        ORDER BY o.created_at DESC
        LIMIT 100
      `

      console.log(`Found ${orders.length} orders`)
    } catch (error) {
      console.log("Complex query failed, trying simple orders query:", error)

      try {
        // Fallback: simple orders query
        orders = await sql`
          SELECT 
            id,
            'Guest Customer' as customer_name,
            'guest@example.com' as customer_email,
            'Custom Plan' as plan_name,
            COALESCE(
              CASE 
                WHEN total IS NOT NULL THEN total
                WHEN total_amount IS NOT NULL THEN total_amount
                ELSE 0
              END, 
              0
            ) as total_amount,
            COALESCE(status, 'pending') as status,
            created_at,
            'weekly' as delivery_frequency,
            1 as duration_weeks
          FROM orders
          ORDER BY created_at DESC
          LIMIT 100
        `

        console.log(`Fallback: Found ${orders.length} orders`)
      } catch (fallbackError) {
        console.log("Fallback query also failed:", fallbackError)
        orders = []
      }
    }

    return NextResponse.json({
      success: true,
      orders: orders,
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch orders",
        orders: [],
      },
      { status: 500 },
    )
  }
}
