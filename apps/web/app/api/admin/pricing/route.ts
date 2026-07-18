import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getSessionUser } from "@/lib/simple-auth"
import { createErrorResponse } from "@/lib/error-handler"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    const cookieStore = cookies()
    const sessionId = cookieStore.get("session-id")?.value
    if (!sessionId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    const user = await getSessionUser(sessionId)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

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
    return createErrorResponse(error, "Failed to fetch pricing data", 500)
  }
}
