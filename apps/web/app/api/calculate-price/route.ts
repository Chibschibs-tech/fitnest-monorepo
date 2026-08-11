import { NextRequest, NextResponse } from "next/server"
import {
  computeSubscriptionPrice,
  computeSubscriptionPriceByPlanTitle,
  PricingError,
} from "@/lib/subscription-pricing"

/**
 * Public pricing endpoint used by the plan builder, the checkout, the admin
 * subscription form and the mobile app.
 *
 * Delegates to computeSubscriptionPrice — the single pricing function — so
 * every surface always shows the exact amount that will be billed.
 *
 * Accepts either `mealPlanId` (preferred) or the legacy `plan` display name.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { plan, mealPlanId, meals, days, duration } = body as {
      plan?: string
      mealPlanId?: number
      meals?: string[]
      days?: number
      duration?: number
    }

    if ((!plan && !mealPlanId) || !Array.isArray(meals) || meals.length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid fields: plan or mealPlanId, meals (array)" },
        { status: 400 },
      )
    }
    if (!days || days < 1 || days > 7) {
      return NextResponse.json({ error: "days must be between 1 and 7" }, { status: 400 })
    }
    if (!duration || duration < 1) {
      return NextResponse.json({ error: "duration must be >= 1" }, { status: 400 })
    }

    const input = { mealTypes: meals, daysPerWeek: days, durationWeeks: duration }
    const price = mealPlanId
      ? await computeSubscriptionPrice({ mealPlanId, ...input })
      : await computeSubscriptionPriceByPlanTitle(plan as string, input)

    // Backward-compatible shape for existing pages (top-level totals + full
    // breakdown under `calculation`).
    return NextResponse.json({
      success: true,
      currency: "MAD",
      mealPlanId: price.mealPlanId,
      basePerDay: price.pricePerDay,
      grossWeekly: price.calculation.grossWeekly,
      subtotal: price.subtotal,
      discountPercentage: price.discountPercentage,
      total: price.total,
      totalRoundedMAD: price.total,
      finalWeekly: price.calculation.finalWeekly,
      discountsApplied: price.calculation.discountsApplied,
      calculation: price.calculation,
    })
  } catch (error) {
    if (error instanceof PricingError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error("Error calculating price:", error)
    return NextResponse.json({ error: "Failed to calculate price" }, { status: 500 })
  }
}
