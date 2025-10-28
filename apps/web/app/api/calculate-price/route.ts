export const dynamic = "force-dynamic";
export const revalidate = 0;

import { type NextRequest, NextResponse } from "next/server"
import { sql, db } from "@/lib/db"
import { z } from "zod"


// Validation schema
const PriceCalculationSchema = z.object({
  plan: z.string().min(1, "Plan is required"),
  meals: z.array(z.string()).min(1, "At least one meal is required"),
  days: z.number().min(1).max(7, "Days must be between 1 and 7"),
  duration: z.number().min(1, "Duration must be at least 1 week"),
})

interface MealPrice {
  meal_type: string
  base_price_mad: number
}

interface DiscountRule {
  discount_type: string
  condition_value: number
  discount_percentage: number
  stackable: boolean
}

interface DiscountApplied {
  type: string
  condition: number
  percentage: number
  amount: number
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = PriceCalculationSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input", details: validation.error.errors }, { status: 400 })
    }

    const { plan, meals, days, duration } = validation.data

    // 1. Get base prices for selected plan and meals
    const mealPrices = (await sql`
      SELECT meal_type, base_price_mad 
      FROM meal_type_prices 
      WHERE plan_name = ${plan} 
        AND meal_type = ANY(${meals})
        AND is_active = true
    `) as MealPrice[]

    if (mealPrices.length !== meals.length) {
      const foundMeals = mealPrices.map((m) => m.meal_type)
      const missingMeals = meals.filter((m) => !foundMeals.includes(m))
      return NextResponse.json({ error: "Some meals not found", missing: missingMeals }, { status: 400 })
    }

    // 2. Calculate base prices
    const pricePerDay = mealPrices.reduce((sum, meal) => sum + Number(meal.base_price_mad), 0)
    const grossWeekly = pricePerDay * days

    // 3. Get applicable discount rules
    const discountRules = (await sql`
      SELECT discount_type, condition_value, discount_percentage, stackable
      FROM discount_rules 
      WHERE is_active = true
        AND (
          (discount_type = 'days_per_week' AND condition_value = ${days})
          OR 
          (discount_type = 'duration_weeks' AND condition_value <= ${duration})
        )
        AND (valid_from IS NULL OR valid_from <= NOW())
        AND (valid_to IS NULL OR valid_to >= NOW())
      ORDER BY discount_type, condition_value DESC
    `) as DiscountRule[]

    // 4. Apply discounts (multiplicative, stackable)
    let finalWeekly = grossWeekly
    const discountsApplied: DiscountApplied[] = []

    // Apply days_per_week discount (only one, exact match)
    const daysDiscount = discountRules.find(
      (rule) => rule.discount_type === "days_per_week" && rule.condition_value === days,
    )
    if (daysDiscount) {
      const discountAmount = finalWeekly * Number(daysDiscount.discount_percentage)
      finalWeekly -= discountAmount
      discountsApplied.push({
        type: "days_per_week",
        condition: daysDiscount.condition_value,
        percentage: Number(daysDiscount.discount_percentage),
        amount: discountAmount,
      })
    }

    // Apply duration discount (highest applicable that's <= duration)
    const applicableDurationDiscounts = discountRules
      .filter((rule) => rule.discount_type === "duration_weeks" && rule.condition_value <= duration)
      .sort((a, b) => b.condition_value - a.condition_value)

    const durationDiscount = applicableDurationDiscounts[0]

    if (durationDiscount && durationDiscount.stackable) {
      const discountAmount = finalWeekly * Number(durationDiscount.discount_percentage)
      finalWeekly -= discountAmount
      discountsApplied.push({
        type: "duration_weeks",
        condition: durationDiscount.condition_value,
        percentage: Number(durationDiscount.discount_percentage),
        amount: discountAmount,
      })
    }

    // 5. Calculate totals
    const totalRoundedMAD = Math.round(finalWeekly * duration * 100) / 100

    return NextResponse.json({
      currency: "MAD",
      pricePerDay: Math.round(pricePerDay * 100) / 100,
      grossWeekly: Math.round(grossWeekly * 100) / 100,
      discountsApplied,
      finalWeekly: Math.round(finalWeekly * 100) / 100,
      durationWeeks: duration,
      totalRoundedMAD,
      breakdown: {
        plan,
        meals,
        days,
        mealPrices: mealPrices.map((m) => ({
          meal: m.meal_type,
          price: Number(m.base_price_mad),
        })),
      },
    })
  } catch (error) {
    console.error("Price calculation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
