import { NextRequest, NextResponse } from "next/server"
import { createErrorResponse, Errors } from "@/lib/error-handler"
import {
  computeSubscriptionPrice,
  computeSubscriptionPriceByPlanTitle,
  PricingError,
} from "@/lib/subscription-pricing"

export const dynamic = "force-dynamic"
export const revalidate = 0

/**
 * Admin price simulator. Same single pricing function as everywhere else.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { plan, mealPlanId, meals, days, duration } = body

    if ((!plan && !mealPlanId) || !meals || !Array.isArray(meals) || meals.length === 0) {
      return createErrorResponse(
        Errors.validation("Missing or invalid fields: plan or mealPlanId, meals (array)"),
        "Missing or invalid fields: plan or mealPlanId, meals (array)",
        400,
      )
    }
    if (!days || days < 1 || days > 7) {
      return createErrorResponse(
        Errors.validation("days must be between 1 and 7"),
        "days must be between 1 and 7",
        400,
      )
    }
    if (!duration || duration < 1) {
      return createErrorResponse(
        Errors.validation("duration must be >= 1"),
        "duration must be >= 1",
        400,
      )
    }

    const input = { mealTypes: meals, daysPerWeek: days, durationWeeks: duration }
    const price = mealPlanId
      ? await computeSubscriptionPrice({ mealPlanId, ...input })
      : await computeSubscriptionPriceByPlanTitle(plan, input)

    return NextResponse.json({
      success: true,
      data: {
        ...price.calculation,
        mealPlanId: price.mealPlanId,
        subtotal: price.subtotal,
        discountPercentage: price.discountPercentage,
        total: price.total,
      },
    })
  } catch (error) {
    if (error instanceof PricingError) {
      return createErrorResponse(error, error.message, error.status)
    }
    return createErrorResponse(error, "Failed to calculate price", 500)
  }
}
