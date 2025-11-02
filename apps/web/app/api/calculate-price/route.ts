import { sql } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { plan, meals, days, duration } = body

    // 1. Get base prices for selected meals using proper filtering
    const mealPrices = await sql`
      SELECT meal_type, base_price_mad
      FROM meal_type_prices
      WHERE plan_name = ${plan} 
        AND meal_type IN (${meals.join(',')})
        AND is_active = true
    `

    if (!mealPrices || mealPrices.length === 0) {
      return NextResponse.json(
        { error: "No meal prices found for this plan" },
        { status: 404 }
      )
    }

    // 2. Calculate price per day
    const pricePerDay = (mealPrices as any[]).reduce(
      (sum, m) => sum + parseFloat(m.base_price_mad || 0),
      0
    )
    const grossWeekly = pricePerDay * days

    // 3. Get applicable discounts
    const discounts = await sql`
      SELECT discount_type, condition_value, discount_percentage
      FROM discount_rules
      WHERE is_active = true
      ORDER BY discount_type DESC
    `

    let finalWeekly = grossWeekly
    const discountsApplied: any[] = []

    // Apply discounts
    for (const discount of (discounts || []) as any[]) {
      if (
        (discount.discount_type === "days_per_week" && discount.condition_value === days) ||
        (discount.discount_type === "duration_weeks" && discount.condition_value <= duration)
      ) {
        const discountAmount = finalWeekly * (discount.discount_percentage as number)
        finalWeekly -= discountAmount
        discountsApplied.push({
          type: discount.discount_type,
          condition: discount.condition_value,
          percentage: discount.discount_percentage,
          amount: discountAmount,
        })
      }
    }

    const totalRoundedMAD = Math.round(finalWeekly * duration * 100) / 100

    return NextResponse.json({
      success: true,
      currency: "MAD",
      pricePerDay,
      grossWeekly,
      discountsApplied,
      finalWeekly,
      durationWeeks: duration,
      totalRoundedMAD,
      breakdown: {
        plan,
        meals,
        days,
        mealPrices: (mealPrices as any[]).map((m) => ({
          meal: m.meal_type,
          price: parseFloat(m.base_price_mad || 0),
        })),
      },
    })
  } catch (error) {
    console.error("Error calculating price:", error)
    return NextResponse.json(
      { error: `Failed to calculate price: ${error}` },
      { status: 500 }
    )
  }
}
