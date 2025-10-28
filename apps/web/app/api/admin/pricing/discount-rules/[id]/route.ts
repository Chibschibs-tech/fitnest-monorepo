export const dynamic = "force-dynamic";
export const revalidate = 0;

import { type NextRequest, NextResponse } from "next/server"
import { sql, db } from "@/lib/db"
import { z } from "zod"


const UpdateDiscountRuleSchema = z.object({
  discount_type: z.enum(["duration_weeks", "days_per_week", "special_offer"]).optional(),
  condition_value: z.number().min(1).optional(),
  discount_percentage: z.number().min(0).max(1).optional(),
  stackable: z.boolean().optional(),
  is_active: z.boolean().optional(),
  valid_from: z.string().nullable().optional(),
  valid_to: z.string().nullable().optional(),
})

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    const result = await sql`
      SELECT id, discount_type, condition_value, discount_percentage, stackable, is_active,
             valid_from, valid_to, created_at, updated_at
      FROM discount_rules
      WHERE id = ${id}
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Discount rule not found" }, { status: 404 })
    }

    return NextResponse.json({ discountRule: result[0] })
  } catch (error) {
    console.error("Error fetching discount rule:", error)
    return NextResponse.json({ error: "Failed to fetch discount rule" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const body = await request.json()
    const validation = UpdateDiscountRuleSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input", details: validation.error.errors }, { status: 400 })
    }

    const updates = validation.data
    const fields: string[] = []
    const values: any[] = []
    let paramCount = 1

    if (updates.discount_type !== undefined) {
      fields.push(`discount_type = $${paramCount}`)
      values.push(updates.discount_type)
      paramCount++
    }
    if (updates.condition_value !== undefined) {
      fields.push(`condition_value = $${paramCount}`)
      values.push(updates.condition_value)
      paramCount++
    }
    if (updates.discount_percentage !== undefined) {
      fields.push(`discount_percentage = $${paramCount}`)
      values.push(updates.discount_percentage)
      paramCount++
    }
    if (updates.stackable !== undefined) {
      fields.push(`stackable = $${paramCount}`)
      values.push(updates.stackable)
      paramCount++
    }
    if (updates.is_active !== undefined) {
      fields.push(`is_active = $${paramCount}`)
      values.push(updates.is_active)
      paramCount++
    }
    if (updates.valid_from !== undefined) {
      fields.push(`valid_from = $${paramCount}`)
      values.push(updates.valid_from)
      paramCount++
    }
    if (updates.valid_to !== undefined) {
      fields.push(`valid_to = $${paramCount}`)
      values.push(updates.valid_to)
      paramCount++
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    fields.push(`updated_at = NOW()`)
    values.push(id)

    const query = `
      UPDATE discount_rules 
      SET ${fields.join(", ")}
      WHERE id = $${paramCount}
      RETURNING id, discount_type, condition_value, discount_percentage, stackable, is_active,
                valid_from, valid_to, created_at, updated_at
    `

    const result = await q(query, values)

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Discount rule not found" }, { status: 404 })
    }

    return NextResponse.json({ discountRule: result.rows[0] })
  } catch (error) {
    console.error("Error updating discount rule:", error)
    return NextResponse.json({ error: "Failed to update discount rule" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    const result = await sql`
      DELETE FROM discount_rules 
      WHERE id = ${id}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Discount rule not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Discount rule deleted successfully" })
  } catch (error) {
    console.error("Error deleting discount rule:", error)
    return NextResponse.json({ error: "Failed to delete discount rule" }, { status: 500 })
  }
}
