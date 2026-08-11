import { sql } from "./db"
import {
  calculateSubscriptionPrice,
  type DiscountRule,
  type MealPrice,
  type PricingResult,
} from "@fitnest/core"

/**
 * THE single server-side entry point for subscription pricing.
 *
 * Every price shown or billed anywhere (plan cards, builder, cart, checkout,
 * admin) MUST come from computeSubscriptionPrice. Nothing else in the codebase
 * is allowed to price a subscription — that is what guarantees the number on
 * a card can never differ from the number on the invoice.
 *
 * The arithmetic itself lives in @fitnest/core (calculateSubscriptionPrice);
 * this module owns the data access (meal_type_prices by meal_plan_id,
 * discount_rules) and the canonical result shape.
 */

export interface SubscriptionPriceInput {
  mealPlanId: number
  mealTypes: string[]
  daysPerWeek: number
  durationWeeks: number
}

export interface SubscriptionPrice {
  mealPlanId: number
  planTitle: string
  /** Sum of the selected meal-type base prices (MAD). */
  pricePerDay: number
  /** Gross amount before discount, for the whole duration (MAD). */
  subtotal: number
  /** Effective discount applied on the subtotal, in whole percent (10 = 10%). */
  discountPercentage: number
  /** Billed amount (MAD). */
  total: number
  /** Full engine breakdown, for UIs that show the detail. */
  calculation: PricingResult
}

export class PricingError extends Error {
  constructor(
    message: string,
    readonly status: number = 400,
  ) {
    super(message)
    this.name = "PricingError"
  }
}

const round2 = (n: number) => Math.round(n * 100) / 100

export async function computeSubscriptionPrice(
  input: SubscriptionPriceInput,
): Promise<SubscriptionPrice> {
  const { mealPlanId, mealTypes, daysPerWeek, durationWeeks } = input

  if (!Number.isInteger(mealPlanId) || mealPlanId <= 0) {
    throw new PricingError("mealPlanId must be a positive integer")
  }
  if (!Array.isArray(mealTypes) || mealTypes.length === 0) {
    throw new PricingError("mealTypes must be a non-empty array")
  }
  if (!Number.isFinite(daysPerWeek) || daysPerWeek < 1 || daysPerWeek > 7) {
    throw new PricingError("daysPerWeek must be between 1 and 7")
  }
  if (!Number.isFinite(durationWeeks) || durationWeeks < 1) {
    throw new PricingError("durationWeeks must be at least 1")
  }

  const plans: Array<{ id: number; title: string }> = await sql`
    SELECT id, title FROM meal_plans WHERE id = ${mealPlanId}
  `
  if (plans.length === 0) {
    throw new PricingError(`Meal plan ${mealPlanId} not found`, 404)
  }
  const plan = plans[0]

  const priceRows: Array<{ meal_type: string; base_price_mad: number }> = await sql`
    SELECT meal_type, base_price_mad
    FROM meal_type_prices
    WHERE meal_plan_id = ${mealPlanId} AND is_active = true
  `

  // Case-insensitive match; duplicates in mealTypes are priced per occurrence
  // (e.g. two snacks per day).
  const priceMap = new Map(priceRows.map((r) => [String(r.meal_type).toLowerCase(), r]))
  const mealPrices: MealPrice[] = []
  const unpriced: string[] = []
  for (const meal of mealTypes) {
    const row = priceMap.get(String(meal).toLowerCase())
    if (row) mealPrices.push({ meal_type: row.meal_type, base_price_mad: row.base_price_mad })
    else unpriced.push(meal)
  }
  if (unpriced.length > 0) {
    throw new PricingError(
      `No active price for meal type(s) ${unpriced.join(", ")} on plan "${plan.title}"`,
      404,
    )
  }

  const discountRules: DiscountRule[] = await sql`
    SELECT discount_type, condition_value, discount_percentage, stackable, stacking_behavior
    FROM discount_rules
    WHERE is_active = true
      AND (valid_from IS NULL OR valid_from <= NOW())
      AND (valid_to IS NULL OR valid_to >= NOW())
  `

  const calculation = calculateSubscriptionPrice(
    mealPrices,
    daysPerWeek,
    durationWeeks,
    discountRules,
    plan.title,
    mealTypes,
  )

  const subtotal = round2(calculation.grossWeekly * durationWeeks)
  const total = calculation.totalRoundedMAD
  const discountPercentage =
    subtotal > 0 ? round2(((subtotal - total) / subtotal) * 100) : 0

  return {
    mealPlanId: plan.id,
    planTitle: plan.title,
    pricePerDay: calculation.pricePerDay,
    subtotal,
    discountPercentage,
    total,
    calculation,
  }
}

/**
 * Legacy bridge: several public entry points still receive the plan as a
 * display name ("Protein Power"). Resolve it to an id here — never couple
 * pricing data to the name itself.
 */
export async function resolveMealPlanIdByTitle(title: string): Promise<number | null> {
  if (!title) return null
  const rows: Array<{ id: number }> = await sql`
    SELECT id FROM meal_plans WHERE lower(title) = lower(${title}) LIMIT 1
  `
  return rows.length > 0 ? rows[0].id : null
}

export async function computeSubscriptionPriceByPlanTitle(
  planTitle: string,
  rest: Omit<SubscriptionPriceInput, "mealPlanId">,
): Promise<SubscriptionPrice> {
  const mealPlanId = await resolveMealPlanIdByTitle(planTitle)
  if (mealPlanId == null) {
    throw new PricingError(`Meal plan "${planTitle}" not found`, 404)
  }
  return computeSubscriptionPrice({ mealPlanId, ...rest })
}
