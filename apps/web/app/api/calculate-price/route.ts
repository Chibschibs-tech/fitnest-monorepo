import { sql } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import {
  calculateSubscriptionPrice,
  type MealPrice,
  type DiscountRule,
} from "@/lib/pricing-calculator"

/**
 * Public pricing endpoint used by /subscribe and /subscribe/checkout.
 *
 * NOTE:
 * - Internally delegates to the shared pricing-calculator module so that
 *   admin and customer flows always use the same logic.
 * - Response keeps backward-compatible top-level fields (basePerDay, grossWeekly, total)
 *   while also exposing the full calculator result under `calculation`.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { plan, meals, days, duration } = body as {
      plan?: string
      meals?: string[]
      days?: number
      duration?: number
    }

    // Basic validation (more detailed validation happens in admin endpoint)
    if (!plan || !Array.isArray(meals) || meals.length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid fields: plan, meals (array)" },
        { status: 400 },
      )
    }

    if (!days || days < 1 || days > 7) {
      return NextResponse.json(
        { error: "days must be between 1 and 7" },
        { status: 400 },
      )
    }

    if (!duration || duration < 1) {
      return NextResponse.json(
        { error: "duration must be >= 1" },
        { status: 400 },
      )
    }

    // 1. Fetch meal prices from DB
    const mealPrices: MealPrice[] = await sql`
      SELECT meal_type, base_price_mad
      FROM meal_type_prices
      WHERE plan_name = ${plan} AND meal_type = ANY(${meals}::text[]) AND is_active = true
    `

    if (mealPrices.length !== meals.length) {
      return NextResponse.json(
        { error: "Some meals not found for this plan" },
        { status: 404 },
      )
    }

    // 2. Fetch discount rules
    const discountRules: DiscountRule[] = await sql`
      SELECT discount_type, condition_value, discount_percentage, stackable
      FROM discount_rules
      WHERE is_active = true
        AND (valid_from IS NULL OR valid_from <= NOW())
        AND (valid_to IS NULL OR valid_to >= NOW())
    `

    // 3. Delegate to shared calculator
    const result = calculateSubscriptionPrice(
      mealPrices,
      days,
      duration,
      discountRules,
      plan,
      meals,
    )

    // Backward-compatible shape for existing /subscribe pages
    return NextResponse.json({
      success: true,
      currency: "MAD",
      basePerDay: result.pricePerDay,
      grossWeekly: result.grossWeekly,
      total: result.totalRoundedMAD,
      calculation: result,
    })
  } catch (error) {
    console.error("Error calculating price:", error)
    return NextResponse.json(
      { error: "Failed to calculate price" },
      { status: 500 },
    )
  }
}
