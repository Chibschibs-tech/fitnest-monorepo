import { sql } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const [mealPrices, discountRules] = await Promise.all([
      sql`SELECT * FROM meal_type_prices WHERE is_active = true`,
      sql`SELECT * FROM discount_rules WHERE is_active = true`
    ])

    const planRows = await sql`SELECT title FROM meal_plans ORDER BY id`
    const plans = planRows.map((r: any) => r.title)
    const mealTypes = ["Breakfast", "Lunch", "Dinner"]

    return NextResponse.json({
      success: true,
      data: { 
        mealPrices, 
        discountRules, 
        plans, 
        mealTypes 
      }
    })
  } catch (error) {
    console.error("Error fetching pricing data:", error)
    return NextResponse.json(
      { error: "Failed to fetch pricing data", details: String(error) },
      { status: 500 }
    )
  }
}
