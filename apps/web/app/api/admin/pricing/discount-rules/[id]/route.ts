import { sql } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { condition_value, discount_percentage, stackable, is_active, valid_from, valid_to } = body
    const id = params.id

    // Validation
    if (discount_percentage !== undefined && (discount_percentage < 0 || discount_percentage > 1)) {
      return NextResponse.json(
        { error: "discount_percentage must be between 0 and 1" },
        { status: 400 }
      )
    }

    // Update
    const result = await sql`
      UPDATE discount_rules
      SET 
        condition_value = COALESCE(${condition_value}, condition_value),
        discount_percentage = COALESCE(${discount_percentage}, discount_percentage),
        stackable = COALESCE(${stackable}, stackable),
        is_active = COALESCE(${is_active}, is_active),
        valid_from = COALESCE(${valid_from}, valid_from),
        valid_to = COALESCE(${valid_to}, valid_to),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Discount rule not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: result[0] })
  } catch (error) {
    console.error("Error updating discount rule:", error)
    return NextResponse.json(
      { error: "Failed to update discount rule" },
      { status: 500 }
    )
  }
}
