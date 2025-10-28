export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"


export async function GET() {
  try {
    // Get all real customers (exclude admin and sample data)
    const customers = await sql`
      SELECT 
        id,
        name,
        email,
        role,
        created_at,
        updated_at
      FROM users 
      WHERE role = 'customer'
      AND email NOT LIKE '%@example.com'
      AND name NOT IN ('Admin User', 'Test User', 'Demo User', 'Sample User')
      ORDER BY created_at DESC
    `

    // Get order counts for each customer
    const customersWithOrders = await Promise.all(
      customers.map(async (customer) => {
        const orderCount = await sql`
          SELECT COUNT(*) as count 
          FROM orders 
          WHERE user_id = ${customer.id}
        `

        return {
          ...customer,
          orderCount: Number(orderCount[0]?.count || 0),
        }
      }),
    )

    return NextResponse.json({
      success: true,
      customers: customersWithOrders,
      total: customers.length,
    })
  } catch (error) {
    console.error("Error fetching customers:", error)
    return NextResponse.json({
      success: false,
      error: error.message,
      customers: [],
    })
  }
}
