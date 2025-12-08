import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { createErrorResponse } from '@/lib/error-handler'

export const dynamic = "force-dynamic"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const orderId = Number.parseInt(params.id)
    
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })
    }
    
    // Build update query using COALESCE pattern for partial updates
    const {
      status,
      total_amount,
      total,
      customer_name,
      customer_email,
      delivery_address,
      delivery_date,
      delivery_time,
      notes,
      ...otherFields
    } = body
    
    const result = await sql`
      UPDATE orders 
      SET 
        status = COALESCE(${status}, status),
        total_amount = COALESCE(${total_amount}, total_amount),
        total = COALESCE(${total}, total),
        customer_name = COALESCE(${customer_name}, customer_name),
        customer_email = COALESCE(${customer_email}, customer_email),
        delivery_address = COALESCE(${delivery_address}, delivery_address),
        delivery_date = COALESCE(${delivery_date}, delivery_date),
        delivery_time = COALESCE(${delivery_time}, delivery_time),
        notes = COALESCE(${notes}, notes),
        updated_at = NOW()
      WHERE id = ${orderId}
      RETURNING *
    `
    
    if (result.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }
    
    return NextResponse.json(result[0])
  } catch (error) {
    return createErrorResponse(error, "Failed to update order", 500)
  }
}
