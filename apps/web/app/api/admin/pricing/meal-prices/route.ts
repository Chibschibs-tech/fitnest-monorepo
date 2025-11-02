import { sql } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const mealPrices = await sql`
      SELECT id, plan_name, meal_type, base_price_mad, is_active, created_at, updated_at 
      FROM meal_type_prices 
      ORDER BY plan_name, meal_type
    `
    
    return NextResponse.json({
      success: true,
      mealPrices: mealPrices
    })
  } catch (error) {
    console.error("Error fetching meal prices:", error)
    return NextResponse.json(
      { error: "Failed to fetch meal prices" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { plan_name, meal_type, base_price_mad } = body

    // Validation
    if (!plan_name || !meal_type || base_price_mad === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: plan_name, meal_type, base_price_mad" },
        { status: 400 }
      )
    }

    if (base_price_mad <= 0) {
      return NextResponse.json(
        { error: "base_price_mad must be greater than 0" },
        { status: 400 }
      )
    }

    // Check if already exists
    const existing = await sql`
      SELECT id FROM meal_type_prices
      WHERE plan_name = ${plan_name} AND meal_type = ${meal_type}
    `

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Meal price already exists for this plan and meal type" },
        { status: 409 }
      )
    }

    // Insert
    const result = await sql`
      INSERT INTO meal_type_prices (plan_name, meal_type, base_price_mad, is_active, created_at, updated_at)
      VALUES (${plan_name}, ${meal_type}, ${base_price_mad}, true, NOW(), NOW())
      RETURNING *
    `

    return NextResponse.json(
      { success: true, data: result[0] },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating meal price:", error)
    return NextResponse.json(
      { error: "Failed to create meal price" },
      { status: 500 }
    )
  }
}
