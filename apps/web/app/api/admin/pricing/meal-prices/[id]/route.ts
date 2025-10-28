export const dynamic = "force-dynamic";
export const revalidate = 0;

import { type NextRequest, NextResponse } from "next/server"
import { sql, db } from "@/lib/db"
import { z } from "zod"


const UpdateMealPriceSchema = z.object({
  plan_name: z.string().min(1).optional(),
  meal_type: z.string().min(1).optional(),
  base_price_mad: z.number().min(0).optional(),
  is_active: z.boolean().optional(),
})

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    const result = await sql`
      SELECT id, plan_name, meal_type, base_price_mad, is_active, created_at, updated_at
      FROM meal_type_prices
      WHERE id = ${id}
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Meal price not found" }, { status: 404 })
    }

    return NextResponse.json({ mealPrice: result[0] })
  } catch (error) {
    console.error("Error fetching meal price:", error)
    return NextResponse.json({ error: "Failed to fetch meal price" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const body = await request.json()
    const validation = UpdateMealPriceSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input", details: validation.error.errors }, { status: 400 })
    }

    const updates = validation.data
    const fields: string[] = []
    const values: any[] = []
    let paramCount = 1

    if (updates.plan_name !== undefined) {
      fields.push(`plan_name = $${paramCount}`)
      values.push(updates.plan_name)
      paramCount++
    }
    if (updates.meal_type !== undefined) {
      fields.push(`meal_type = $${paramCount}`)
      values.push(updates.meal_type)
      paramCount++
    }
    if (updates.base_price_mad !== undefined) {
      fields.push(`base_price_mad = $${paramCount}`)
      values.push(updates.base_price_mad)
      paramCount++
    }
    if (updates.is_active !== undefined) {
      fields.push(`is_active = $${paramCount}`)
      values.push(updates.is_active)
      paramCount++
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    fields.push(`updated_at = NOW()`)
    values.push(id)

    const query = `
      UPDATE meal_type_prices 
      SET ${fields.join(", ")}
      WHERE id = $${paramCount}
      RETURNING id, plan_name, meal_type, base_price_mad, is_active, created_at, updated_at
    `

    const result = await q(query, values)

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Meal price not found" }, { status: 404 })
    }

    return NextResponse.json({ mealPrice: result.rows[0] })
  } catch (error: any) {
    console.error("Error updating meal price:", error)

    if (error.code === "23505") {
      return NextResponse.json({ error: "Meal price with this plan and meal type already exists" }, { status: 409 })
    }

    return NextResponse.json({ error: "Failed to update meal price" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    const result = await sql`
      DELETE FROM meal_type_prices 
      WHERE id = ${id}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Meal price not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Meal price deleted successfully" })
  } catch (error) {
    console.error("Error deleting meal price:", error)
    return NextResponse.json({ error: "Failed to delete meal price" }, { status: 500 })
  }
}
