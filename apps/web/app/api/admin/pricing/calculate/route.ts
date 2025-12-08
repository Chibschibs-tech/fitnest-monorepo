import { sql } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { calculateSubscriptionPrice, MealPrice, DiscountRule } from "@/lib/pricing-calculator"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Database connection not available" },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { plan, meals, days, duration } = body

    // Validation
    if (!plan || !meals || !Array.isArray(meals) || meals.length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid fields: plan, meals (array)" },
        { status: 400 }
      )
    }

    if (!days || days < 1 || days > 7) {
      return NextResponse.json(
        { error: "days must be between 1 and 7" },
        { status: 400 }
      )
    }

    if (!duration || duration < 1) {
      return NextResponse.json(
        { error: "duration must be >= 1" },
        { status: 400 }
      )
    }

    // Fetch meal prices
    const mealPrices: MealPrice[] = await sql`
      SELECT meal_type, base_price_mad
      FROM meal_type_prices
      WHERE plan_name = ${plan} AND meal_type = ANY(${meals}::text[]) AND is_active = true
    `

    if (mealPrices.length !== meals.length) {
      return NextResponse.json(
        { error: "Some meals not found for this plan" },
        { status: 404 }
      )
    }

    // Fetch discount rules
    const discountRules: DiscountRule[] = await sql`
      SELECT discount_type, condition_value, discount_percentage, stackable
      FROM discount_rules
      WHERE is_active = true
        AND (valid_from IS NULL OR valid_from <= NOW())
        AND (valid_to IS NULL OR valid_to >= NOW())
    `

    // Calculate
    const result = calculateSubscriptionPrice(
      mealPrices,
      days,
      duration,
      discountRules,
      plan,
      meals
    )

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error("Error calculating price:", error)
    return NextResponse.json(
      { error: "Failed to calculate price" },
      { status: 500 }
    )
  }
}
