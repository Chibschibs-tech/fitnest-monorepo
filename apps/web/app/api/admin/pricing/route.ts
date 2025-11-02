import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Fetch all active meal prices
    const mealPrices = await sql`
      SELECT id, plan_name, meal_type, base_price_mad, is_active, created_at, updated_at
      FROM meal_type_prices
      WHERE is_active = true
      ORDER BY plan_name, meal_type
    `

    // Fetch all active discount rules
    const discountRules = await sql`
      SELECT id, discount_type, condition_value, discount_percentage, stackable, is_active, valid_from, valid_to, created_at, updated_at
      FROM discount_rules
      WHERE is_active = true
      ORDER BY discount_type, condition_value
    `

    // Return metadata
    const plans = ["Weight Loss", "Stay Fit", "Muscle Gain"]
    const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snacks"]

    return NextResponse.json({
      success: true,
      data: {
        mealPrices,
        discountRules,
        plans,
        mealTypes,
      },
    })
  } catch (error) {
    console.error("Error fetching pricing data:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch pricing data" },
      { status: 500 }
    )
  }
}
