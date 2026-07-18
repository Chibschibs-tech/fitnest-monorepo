import { sql } from "@/lib/db"
import { calculateSubscriptionPrice, type DiscountRule, type MealPrice } from "@/lib/pricing-calculator"

/**
 * Entry ("à partir de") pricing for the plan cards.
 *
 * Computed with the SAME engine that prices the builder and checkout, so the
 * number on a card can never drift from what the customer actually pays.
 * Never reads plan_variants.weekly_price_mad (a stored value that goes stale).
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
  if (planNames.length === 0) return out

  try {
    const priceRows: Array<{ plan_name: string; meal_type: string; base_price_mad: number }> =
      await sql`
        SELECT plan_name, meal_type, base_price_mad
        FROM meal_type_prices
        WHERE is_active = true
      `

    const discountRules: DiscountRule[] = await sql`
      SELECT discount_type, condition_value, discount_percentage, stackable, stacking_behavior
      FROM discount_rules
      WHERE is_active = true
        AND (valid_from IS NULL OR valid_from <= NOW())
        AND (valid_to IS NULL OR valid_to >= NOW())
    `

    for (const planName of planNames) {
      const byType = new Map(
        priceRows
          .filter((r) => String(r.plan_name).toLowerCase() === planName.toLowerCase())
          .map((r) => [String(r.meal_type).toLowerCase(), r]),
      )

      const mealPrices: MealPrice[] = []
      for (const meal of ENTRY_MEALS) {
        const row = byType.get(meal.toLowerCase())
        if (row) mealPrices.push({ meal_type: row.meal_type, base_price_mad: row.base_price_mad })
      }
      if (mealPrices.length === 0) continue

      const result = calculateSubscriptionPrice(
        mealPrices,
        ENTRY_DAYS,
        ENTRY_WEEKS,
        discountRules,
        planName,
        ENTRY_MEALS,
      )

      out[planName] = {
        planName,
        pricePerDay: result.pricePerDay,
        weekly: result.finalWeekly,
      }
    }
  } catch (error) {
    // Pricing must never take the page down - the card simply omits the price.
    console.error("Failed to compute plan entry prices:", error)
  }

  return out
}
