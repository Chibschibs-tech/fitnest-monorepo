export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"
import { DeliveryService } from "@/lib/delivery-service"


export async function POST() {
  try {
    // Get all orders that don't have deliveries yet
    const ordersWithoutDeliveries = await sql`
      SELECT o.id, o.created_at
      FROM orders o
      LEFT JOIN deliveries d ON o.id = d.order_id
      WHERE d.id IS NULL
      ORDER BY o.created_at ASC
    `

    let generatedCount = 0

    for (const order of ordersWithoutDeliveries) {
      try {
        // Use order creation date as start date, or add a few days for first delivery
        const startDate = new Date(order.created_at)
        startDate.setDate(startDate.getDate() + 2) // First delivery 2 days after order

        await DeliveryService.generateDeliverySchedule(order.id, startDate, 8)
        generatedCount++
      } catch (error) {
        console.error(`Error generating deliveries for order ${order.id}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Generated delivery schedules for ${generatedCount} orders`,
      processedOrders: ordersWithoutDeliveries.length,
    })
  } catch (error) {
    console.error("Error generating deliveries:", error)
    return NextResponse.json({ success: false, message: "Failed to generate deliveries" }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Get statistics about deliveries
    const stats = await sql`
      SELECT 
        COUNT(DISTINCT o.id) as total_orders,
        COUNT(DISTINCT d.order_id) as orders_with_deliveries,
        COUNT(d.id) as total_deliveries,
        COUNT(CASE WHEN d.status = 'pending' THEN 1 END) as pending_deliveries,
        COUNT(CASE WHEN d.status = 'delivered' THEN 1 END) as completed_deliveries
      FROM orders o
      LEFT JOIN deliveries d ON o.id = d.order_id
    `

    return NextResponse.json({
      success: true,
      stats: stats[0],
    })
  } catch (error) {
    console.error("Error getting delivery stats:", error)
    return NextResponse.json({ success: false, message: "Failed to get delivery stats" }, { status: 500 })
  }
}
