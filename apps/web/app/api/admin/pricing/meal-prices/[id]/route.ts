import { sql } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { base_price_mad, is_active } = body
    const id = params.id

    // Validation
    if (base_price_mad !== undefined && base_price_mad <= 0) {
      return NextResponse.json(
        { error: "base_price_mad must be greater than 0" },
        { status: 400 }
      )
    }

    // Update
    const result = await sql`
      UPDATE meal_type_prices
      SET 
        base_price_mad = COALESCE(${base_price_mad}, base_price_mad),
        is_active = COALESCE(${is_active}, is_active),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Meal price not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: result[0] })
  } catch (error) {
    console.error("Error updating meal price:", error)
    return NextResponse.json(
      { error: "Failed to update meal price" },
      { status: 500 }
    )
  }
}
