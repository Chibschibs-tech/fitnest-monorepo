import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { createErrorResponse } from '@/lib/error-handler'

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const coupons = await sql`
      SELECT * 
      FROM coupons 
      ORDER BY created_at DESC
    `
    return NextResponse.json(coupons || [])
  } catch (error) {
    return createErrorResponse(error, "Failed to fetch coupons", 500)
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { code, discount_percentage, valid_from, valid_to, is_active } = body
    
    const result = await sql`
      INSERT INTO coupons (code, discount_percentage, valid_from, valid_to, is_active, created_at)
      VALUES (${code}, ${discount_percentage}, ${valid_from || null}, ${valid_to || null}, ${is_active ?? true}, NOW())
      RETURNING *
    `
    
    return NextResponse.json(result[0] || result)
  } catch (error) {
    return createErrorResponse(error, "Failed to create coupon", 500)
  }
}
