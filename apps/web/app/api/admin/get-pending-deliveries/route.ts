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

    console.log("Fetching deliveries for admin...")

    // Create deliveries table if it doesn't exist
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS deliveries (
          id SERIAL PRIMARY KEY,
          order_id INTEGER NOT NULL,
          customer_name VARCHAR(255) NOT NULL,
          customer_email VARCHAR(255) NOT NULL,
          delivery_date DATE NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          total_amount DECIMAL(10,2) DEFAULT 0,
          week_number INTEGER DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `

      // Check if we have any deliveries, if not create some sample data
      const existingDeliveries = await sql`SELECT COUNT(*) as count FROM deliveries`

      if (existingDeliveries[0].count === 0) {
        // Create sample deliveries
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        const dayAfter = new Date(today)
        dayAfter.setDate(dayAfter.getDate() + 2)

        await sql`
          INSERT INTO deliveries (order_id, customer_name, customer_email, delivery_date, status, total_amount, week_number)
          VALUES 
            (1, 'Ahmed Hassan', 'ahmed@example.com', ${today.toISOString().split("T")[0]}, 'pending', 300, 1),
            (2, 'Fatima Zahra', 'fatima@example.com', ${tomorrow.toISOString().split("T")[0]}, 'pending', 400, 1),
            (3, 'Omar Benali', 'omar@example.com', ${dayAfter.toISOString().split("T")[0]}, 'pending', 350, 1),
            (1, 'Ahmed Hassan', 'ahmed@example.com', ${new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}, 'pending', 300, 2),
            (2, 'Fatima Zahra', 'fatima@example.com', ${new Date(tomorrow.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}, 'delivered', 400, 2)
        `
      }
    } catch (tableError) {
      console.error("Error with deliveries table:", tableError)
    }

    // Fetch all deliveries
    const deliveries = await sql`
      SELECT 
        d.id,
        d.order_id,
        d.customer_name,
        d.customer_email,
        d.delivery_date,
        d.status,
        d.total_amount,
        d.week_number
      FROM deliveries d
      ORDER BY d.delivery_date ASC
    `

    console.log(`Found ${deliveries.length} deliveries`)

    return NextResponse.json({
      success: true,
      deliveries: deliveries || [],
    })
  } catch (error) {
    console.error("Error fetching deliveries:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch deliveries",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
