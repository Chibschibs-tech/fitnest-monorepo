import {
  computeSubscriptionPriceByPlanTitle,
} from "./subscription-pricing"

/**
 * Entry ("à partir de") pricing for the plan cards.
 *
 * Delegates to computeSubscriptionPrice — the single pricing function — so the
 * number on a card can never drift from what the customer actually pays.
 */

// Baseline shown on the cards: the cheapest configuration the builder allows.
export const ENTRY_MEALS = ["Lunch", "Dinner"]
export const ENTRY_DAYS = 5
export const ENTRY_WEEKS = 1

export interface PlanEntryPrice {
  planName: string
  pricePerDay: number
  weekly: number
}

export async function getPlanEntryPrices(
  planNames: string[],
): Promise<Record<string, PlanEntryPrice>> {
  const out: Record<string, PlanEntryPrice> = {}

  for (const planName of planNames) {
    try {
      const price = await computeSubscriptionPriceByPlanTitle(planName, {
        mealTypes: ENTRY_MEALS,
        daysPerWeek: ENTRY_DAYS,
        durationWeeks: ENTRY_WEEKS,
      })
      out[planName] = {
        planName,
        pricePerDay: price.pricePerDay,
        weekly: price.calculation.finalWeekly,
      }
    } catch (error) {
      // Pricing must never take the page down - the card simply omits the price.
      console.error(`Failed to compute entry price for plan "${planName}":`, error)
    }
  }

  return out
}
