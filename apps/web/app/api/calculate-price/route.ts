import { sql } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { plan_name, meal_types, days_per_week, duration_weeks } = body

    // Get base prices
    const prices = await sql`
      SELECT base_price_mad FROM meal_type_prices
      WHERE plan_name = ${plan_name} AND meal_type = ANY(${meal_types})
    `

    if (!prices || prices.length === 0) {
      return NextResponse.json(
        { error: "Prices not found for this plan" },
        { status: 404 }
      )
    }

    // Get discounts
    const daysDiscount = await sql`
      SELECT discount_percentage FROM discount_rules
      WHERE discount_type = 'days_per_week' AND condition_value = ${days_per_week} AND is_active = true
    `

    const durationDiscount = await sql`
      SELECT discount_percentage FROM discount_rules
      WHERE discount_type = 'duration_weeks' AND condition_value <= ${duration_weeks} AND is_active = true
      ORDER BY condition_value DESC LIMIT 1
    `

    // Calculate total
    const basePrice = prices.reduce((sum, p) => sum + parseFloat(p.base_price_mad), 0)
    const weeklyPrice = basePrice * days_per_week
    const daysDiscountRate = daysDiscount[0]?.discount_percentage || 0
    const durationDiscountRate = durationDiscount[0]?.discount_percentage || 0

    // Apply discounts (multiplicative)
    const afterDaysDiscount = weeklyPrice * (1 - daysDiscountRate)
    const finalPrice = afterDaysDiscount * (1 - durationDiscountRate) * duration_weeks

    return NextResponse.json({
      success: true,
      calculation: {
        basePrice: basePrice.toFixed(2),
        weeklyPrice: weeklyPrice.toFixed(2),
        daysDiscountRate: (daysDiscountRate * 100).toFixed(1),
        durationDiscountRate: (durationDiscountRate * 100).toFixed(1),
        finalPrice: finalPrice.toFixed(2)
      }
    })
  } catch (error) {
    console.error("Error calculating price:", error)
    return NextResponse.json(
      { error: "Failed to calculate price" },
      { status: 500 }
    )
  }
}
