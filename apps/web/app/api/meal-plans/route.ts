import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const mealPlans = await sql`
      SELECT id, name, description, plan_type, target_calories_min, target_calories_max, weekly_price, is_active
      FROM meal_plans
      WHERE is_active = true
      ORDER BY weekly_price ASC
    `

    return NextResponse.json({
      success: true,
      mealPlans,
    })
  } catch (error) {
    console.error("Error fetching meal plans:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch meal plans",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
