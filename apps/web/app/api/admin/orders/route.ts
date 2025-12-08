import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { createErrorResponse } from '@/lib/error-handler'

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    let orders
    
    if (status) {
      orders = await sql`
        SELECT 
          o.*,
          u.name as customer_name,
          u.email as customer_email,
          mp.name as plan_name
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN meal_plans mp ON o.plan_id = mp.id
        WHERE o.status = ${status}
        ORDER BY o.created_at DESC
      `
    } else {
      orders = await sql`
        SELECT 
          o.*,
          u.name as customer_name,
          u.email as customer_email,
          mp.name as plan_name
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN meal_plans mp ON o.plan_id = mp.id
        ORDER BY o.created_at DESC
      `
    }
    
    return NextResponse.json(orders || [])
  } catch (error) {
    return createErrorResponse(error, "Failed to fetch orders", 500)
  }
}
