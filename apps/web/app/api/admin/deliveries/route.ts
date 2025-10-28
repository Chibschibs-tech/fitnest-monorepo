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

    console.log("Fetching deliveries for admin...")

    let deliveries = []

    try {
      // Try to get deliveries from orders with delivery information
      const deliveriesQuery = await sql`
        SELECT 
          o.id,
          o.user_id,
          COALESCE(u.name, o.customer_name, 'Unknown Customer') as customer_name,
          COALESCE(u.email, o.customer_email, 'no-email@example.com') as customer_email,
          COALESCE(u.phone, o.customer_phone) as customer_phone,
          COALESCE(o.delivery_address, u.address, 'No address') as delivery_address,
          o.delivery_date,
          o.delivery_time,
          o.status as order_status,
          COALESCE(o.total_amount, o.total, 0) as total_amount,
          o.created_at,
          o.updated_at
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        WHERE o.status IN ('active', 'processing', 'confirmed') OR o.status IS NULL
        ORDER BY o.delivery_date ASC, o.created_at DESC
      `

      deliveries = deliveriesQuery.map((delivery) => ({
        id: Number(delivery.id),
        order_id: Number(delivery.id),
        customer_name: delivery.customer_name,
        customer_email: delivery.customer_email,
        customer_phone: delivery.customer_phone,
        delivery_address: delivery.delivery_address,
        delivery_date: delivery.delivery_date || new Date().toISOString().split("T")[0],
        delivery_time: delivery.delivery_time || "12:00",
        status: delivery.order_status === "delivered" ? "delivered" : "pending",
        total_amount: Number(delivery.total_amount) || 0,
        created_at: delivery.created_at,
        updated_at: delivery.updated_at,
      }))

      console.log(`Found ${deliveries.length} deliveries`)
    } catch (error) {
      console.log("Deliveries query failed:", error)
      deliveries = []
    }

    return NextResponse.json({
      success: true,
      deliveries,
      total: deliveries.length,
    })
  } catch (error) {
    console.error("Error fetching deliveries:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch deliveries",
        error: error instanceof Error ? error.message : "Unknown error",
        deliveries: [],
        total: 0,
      },
      { status: 500 },
    )
  }
}
