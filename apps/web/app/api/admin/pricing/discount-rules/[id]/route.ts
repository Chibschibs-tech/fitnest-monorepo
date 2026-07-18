import { sql } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

const BEHAVIORS = ["stack", "exclusive", "best"]

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { condition_value, discount_percentage, stacking_behavior, is_active, valid_from, valid_to } = body
    const id = params.id

    // discount_percentage is stored as a WHOLE percent (5 = 5%).
    if (discount_percentage !== undefined && (discount_percentage < 0 || discount_percentage > 100)) {
      return NextResponse.json(
        { error: "discount_percentage must be between 0 and 100 (5 = 5 percent)" },
        { status: 400 },
      )
    }

    if (stacking_behavior !== undefined && !BEHAVIORS.includes(stacking_behavior)) {
      return NextResponse.json(
        { error: "stacking_behavior must be stack, exclusive or best" },
        { status: 400 },
      )
    }

    // Keep the legacy boolean in sync so any older reader stays correct.
    const nextBehavior = stacking_behavior ?? null
    const nextStackable = stacking_behavior === undefined ? null : stacking_behavior === "stack"

    const result = await sql`
      UPDATE discount_rules
      SET
        condition_value = COALESCE(${condition_value ?? null}, condition_value),
        discount_percentage = COALESCE(${discount_percentage ?? null}, discount_percentage),
        stacking_behavior = COALESCE(${nextBehavior}, stacking_behavior),
        stackable = COALESCE(${nextStackable}, stackable),
        is_active = COALESCE(${is_active ?? null}, is_active),
        valid_from = COALESCE(${valid_from ?? null}, valid_from),
        valid_to = COALESCE(${valid_to ?? null}, valid_to),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Discount rule not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result[0] })
  } catch (error) {
    console.error("Error updating discount rule:", error)
    return NextResponse.json({ error: "Failed to update discount rule" }, { status: 500 })
  }
}
