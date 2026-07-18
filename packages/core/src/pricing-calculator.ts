/**
 * Pricing Calculator - Database-Driven Pricing Engine (hardened)
 *
 * Single source of truth for subscription pricing. Reads meal prices and
 * discount rules from the database (meal_type_prices, discount_rules).
 *
 * Fixes vs previous version:
 *  - discount_type now matches the real DB values ("days","duration") as well
 *    as legacy long names ("days_per_week","duration_weeks").
 *  - discount_percentage is treated as a WHOLE percent (5 => 5%), not a fraction.
 *  - stacking is admin-controlled per rule via `stacking_behavior`:
 *      "exclusive" -> if applicable, it wins alone (suppresses all others)
 *      "stack"     -> always combines on top of other discounts
 *      "best"      -> competes with other "best" rules; only the largest applies
 *    Falls back to legacy `stackable` (true => "stack", else "best").
 */

export interface MealPrice {
  meal_type: string
  base_price_mad: number | string
}

export type StackingBehavior = "stack" | "exclusive" | "best"

export interface DiscountRule {
  discount_type: string
  condition_value: number
  discount_percentage: number | string
  stackable?: boolean
  stacking_behavior?: StackingBehavior
  is_active?: boolean
}

export interface AppliedDiscount {
  type: string
  condition: number
  percentage: number
  behavior: StackingBehavior
  amount: number
}

export interface PricingResult {
  pricePerDay: number
  grossWeekly: number
  discountsApplied: AppliedDiscount[]
  finalWeekly: number
  durationWeeks: number
  totalRoundedMAD: number
  unpricedMeals: string[]
  breakdown: {
    plan: string
    meals: string[]
    days: number
    mealPrices: Array<{ meal: string; price: number }>
  }
}

const round2 = (n: number) => Math.round(n * 100) / 100
const num = (v: number | string | null | undefined) => parseFloat(String(v ?? 0)) || 0

function normalizeType(t: string): string {
  const s = (t || "").toLowerCase()
  if (s === "days_per_week") return "days"
  if (s === "duration_weeks") return "duration"
  return s
}

function behaviorOf(rule: DiscountRule): StackingBehavior {
  if (rule.stacking_behavior) return rule.stacking_behavior
  return rule.stackable ? "stack" : "best"
}

/**
 * Pick the discount rules that apply to this order, reduced to one candidate
 * per tiered type (best "days" match, highest applicable "duration" tier).
 */
function selectApplicableRules(
  rules: DiscountRule[],
  days: number,
  duration: number
): DiscountRule[] {
  const active = rules.filter((r) => r.is_active !== false)

  // days: exact match on days-per-week; if several, keep the largest percentage
  const dayRules = active
    .filter((r) => normalizeType(r.discount_type) === "days" && r.condition_value === days)
    .sort((a, b) => num(b.discount_percentage) - num(a.discount_percentage))

  // duration: all tiers whose threshold is <= chosen duration; keep the longest tier
  const durRules = active
    .filter(
      (r) =>
        normalizeType(r.discount_type) === "duration" &&
        r.condition_value > 0 &&
        r.condition_value <= duration
    )
    .sort((a, b) => b.condition_value - a.condition_value)

  const picked: DiscountRule[] = []
  if (dayRules[0]) picked.push(dayRules[0])
  if (durRules[0]) picked.push(durRules[0])
  return picked
}

function combineDiscounts(
  gross: number,
  applicable: DiscountRule[]
): { finalWeekly: number; discountsApplied: AppliedDiscount[] } {
  if (applicable.length === 0) return { finalWeekly: gross, discountsApplied: [] }

  const mk = (r: DiscountRule, amount: number): AppliedDiscount => ({
    type: normalizeType(r.discount_type),
    condition: r.condition_value,
    percentage: num(r.discount_percentage),
    behavior: behaviorOf(r),
    amount: round2(amount),
  })

  // 1. Exclusive wins alone (highest percentage if several)
  const exclusives = applicable
    .filter((r) => behaviorOf(r) === "exclusive")
    .sort((a, b) => num(b.discount_percentage) - num(a.discount_percentage))
  if (exclusives.length > 0) {
    const winner = exclusives[0]
    const amount = gross * (num(winner.discount_percentage) / 100)
    return { finalWeekly: gross - amount, discountsApplied: [mk(winner, amount)] }
  }

  // 2. All "stack" rules compound; among "best" rules only the largest applies
  let running = gross
  const applied: AppliedDiscount[] = []

  for (const r of applicable.filter((x) => behaviorOf(x) === "stack")) {
    const amount = running * (num(r.discount_percentage) / 100)
    running -= amount
    applied.push(mk(r, amount))
  }

  const bests = applicable
    .filter((r) => behaviorOf(r) === "best")
    .sort((a, b) => num(b.discount_percentage) - num(a.discount_percentage))
  if (bests[0]) {
    const amount = running * (num(bests[0].discount_percentage) / 100)
    running -= amount
    applied.push(mk(bests[0], amount))
  }

  return { finalWeekly: running, discountsApplied: applied }
}

/**
 * Calculate subscription price from DB meal prices + discount rules.
 */
export function calculateSubscriptionPrice(
  mealPrices: MealPrice[],
  days: number,
  duration: number,
  discountRules: DiscountRule[],
  plan: string,
  meals: string[]
): PricingResult {
  const priced = mealPrices.map((m) => ({ meal: m.meal_type, price: num(m.base_price_mad) }))
  const pricedTypes = new Set(priced.map((m) => m.meal))
  const unpricedMeals = meals.filter((m) => !pricedTypes.has(m))

  const pricePerDay = priced.reduce((sum, m) => sum + m.price, 0)
  const grossWeekly = pricePerDay * days

  const applicable = selectApplicableRules(discountRules, days, duration)
  const { finalWeekly, discountsApplied } = combineDiscounts(grossWeekly, applicable)

  const totalRoundedMAD = round2(finalWeekly * duration)

  return {
    pricePerDay: round2(pricePerDay),
    grossWeekly: round2(grossWeekly),
    discountsApplied,
    finalWeekly: round2(finalWeekly),
    durationWeeks: duration,
    totalRoundedMAD,
    unpricedMeals,
    breakdown: { plan, meals, days, mealPrices: priced },
  }
}

export function validatePricingInputs(
  mealPrices: MealPrice[],
  days: number,
  duration: number
): { isValid: boolean; error?: string } {
  if (!mealPrices || mealPrices.length === 0) {
    return { isValid: false, error: "No meal prices provided" }
  }
  if (days < 1 || days > 7) {
    return { isValid: false, error: "Days must be between 1 and 7" }
  }
  if (duration < 1) {
    return { isValid: false, error: "Duration must be at least 1 week" }
  }
  return { isValid: true }
}
