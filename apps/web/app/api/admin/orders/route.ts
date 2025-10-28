export const dynamic = "force-dynamic";
export const revalidate = 0;

import { type NextRequest, NextResponse } from "next/server"
import { sql, db } from "@/lib/db"
import { getSessionUser } from "@/lib/simple-auth"


export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const sessionId = request.cookies.get("session-id")?.value
    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getSessionUser(sessionId)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    console.log("Fetching orders for admin...")

    // First, ensure the orders table exists and has some sample data
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          customer_name VARCHAR(255) NOT NULL,
          customer_email VARCHAR(255) NOT NULL,
          plan_name VARCHAR(255),
          total_amount DECIMAL(10,2) DEFAULT 0,
          status VARCHAR(50) DEFAULT 'active',
          delivery_frequency VARCHAR(50) DEFAULT 'weekly',
          duration_weeks INTEGER DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `

      // Check if we have any orders
      const orderCount = await sql`SELECT COUNT(*) as count FROM orders`

      if (orderCount[0].count === 0) {
        // Create some sample orders
        await sql`
          INSERT INTO orders (customer_name, customer_email, plan_name, total_amount, status, duration_weeks)
          VALUES 
            ('Ahmed Hassan', 'ahmed@example.com', 'Weight Loss Plan', 1200, 'active', 4),
            ('Fatima Zahra', 'fatima@example.com', 'Muscle Gain Plan', 1600, 'active', 2),
            ('Omar Benali', 'omar@example.com', 'Keto Plan', 1400, 'paused', 3),
            ('Aicha Alami', 'aicha@example.com', 'Stay Fit Plan', 1000, 'active', 1),
            ('Youssef Tazi', 'youssef@example.com', 'Weight Loss Plan', 1300, 'completed', 4)
        `
      }
    } catch (tableError) {
      console.error("Error with orders table:", tableError)
    }

    // Fetch all orders with customer information
    const orders = await sql`
      SELECT 
        o.id,
        o.customer_name,
        o.customer_email,
        o.plan_name,
        o.total_amount,
        o.status,
        o.created_at,
        o.delivery_frequency,
        o.duration_weeks
      FROM orders o
      ORDER BY o.created_at DESC
    `

    console.log(`Found ${orders.length} orders`)

    return NextResponse.json({
      success: true,
      orders: orders || [],
    })
  } catch (error) {
    console.error("Error fetching admin orders:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch orders",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
