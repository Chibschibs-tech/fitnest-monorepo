export const dynamic = "force-dynamic";
export const revalidate = 0;

import { type NextRequest, NextResponse } from "next/server"
import { sql, db } from "@/lib/db"
import { z } from "zod"


const MealPriceSchema = z.object({
  plan_name: z.string().min(1, "Plan name is required"),
  meal_type: z.string().min(1, "Meal type is required"),
  base_price_mad: z.number().min(0, "Price must be positive"),
  is_active: z.boolean().optional().default(true),
})

export async function GET() {
  try {
    const mealPrices = await sql`
      SELECT id, plan_name, meal_type, base_price_mad, is_active, created_at, updated_at
      FROM meal_type_prices
      ORDER BY plan_name, meal_type
    `

    return NextResponse.json({ mealPrices })
  } catch (error) {
    console.error("Error fetching meal prices:", error)
    return NextResponse.json({ error: "Failed to fetch meal prices" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = MealPriceSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input", details: validation.error.errors }, { status: 400 })
    }

    const { plan_name, meal_type, base_price_mad, is_active } = validation.data

    const result = await sql`
      INSERT INTO meal_type_prices (plan_name, meal_type, base_price_mad, is_active)
      VALUES (${plan_name}, ${meal_type}, ${base_price_mad}, ${is_active})
      RETURNING id, plan_name, meal_type, base_price_mad, is_active, created_at, updated_at
    `

    return NextResponse.json({ mealPrice: result[0] }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating meal price:", error)

    if (error.code === "23505") {
      // Unique constraint violation
      return NextResponse.json({ error: "Meal price for this plan and meal type already exists" }, { status: 409 })
    }

    return NextResponse.json({ error: "Failed to create meal price" }, { status: 500 })
  }
}
