/**
 * Pricing Calculator - Database-Driven Pricing Engine
 * 
 * This module provides functions to calculate subscription prices
 * based on meal prices and discount rules from the database.
 */

export interface MealPrice {
  meal_type: string
  base_price_mad: number
}

export interface DiscountRule {
  discount_type: "days_per_week" | "duration_weeks" | "volume" | "seasonal"
  condition_value: number
  discount_percentage: number
  stackable?: boolean
}

export interface PricingResult {
  pricePerDay: number
  grossWeekly: number
  discountsApplied: Array<{
    type: string
    condition: number
    percentage: number
    amount: number
  }>
  finalWeekly: number
  durationWeeks: number
  totalRoundedMAD: number
  breakdown: {
    plan: string
    meals: string[]
    days: number
    mealPrices: Array<{
      meal: string
      price: number
    }>
  }
}

/**
 * Calculate subscription price based on meal prices and discount rules
 * 
 * @param mealPrices - Array of meal prices from database
 * @param days - Number of days per week (1-7)
 * @param duration - Duration in weeks
 * @param discountRules - Array of discount rules from database
 * @param plan - Plan name (for reference)
 * @param meals - Array of meal types selected (for reference)
 * @returns PricingResult with detailed breakdown
 */
export function calculateSubscriptionPrice(
  mealPrices: MealPrice[],
  days: number,
  duration: number,
  discountRules: DiscountRule[],
  plan: string,
  meals: string[]
): PricingResult {
  // 1. Calculate price per day (sum of selected meal prices)
  const pricePerDay = mealPrices.reduce(
    (sum, meal) => sum + parseFloat(String(meal.base_price_mad || 0)),
    0
  )

  // 2. Calculate gross weekly price
  const grossWeekly = pricePerDay * days

  // 3. Apply discounts
  let finalWeekly = grossWeekly
  const discountsApplied: PricingResult["discountsApplied"] = []

  // Apply days_per_week discounts (exact match)
  const daysDiscount = discountRules.find(
    (rule) => rule.discount_type === "days_per_week" && rule.condition_value === days
  )
  if (daysDiscount) {
    const discountAmount = finalWeekly * daysDiscount.discount_percentage
    finalWeekly -= discountAmount
    discountsApplied.push({
      type: "days_per_week",
      condition: daysDiscount.condition_value,
      percentage: daysDiscount.discount_percentage,
      amount: discountAmount,
    })
  }

  // Apply duration_weeks discounts (condition_value <= duration)
  const durationDiscounts = discountRules
    .filter(
      (rule) =>
        rule.discount_type === "duration_weeks" &&
        rule.condition_value <= duration &&
        rule.condition_value > 0
    )
    .sort((a, b) => b.condition_value - a.condition_value) // Get highest applicable discount

  if (durationDiscounts.length > 0) {
    // Use the highest applicable discount (longest duration)
    const bestDurationDiscount = durationDiscounts[0]
    const discountAmount = finalWeekly * bestDurationDiscount.discount_percentage
    finalWeekly -= discountAmount
    discountsApplied.push({
      type: "duration_weeks",
      condition: bestDurationDiscount.condition_value,
      percentage: bestDurationDiscount.discount_percentage,
      amount: discountAmount,
    })
  }

  // 4. Calculate total for entire subscription
  const totalRoundedMAD = Math.round(finalWeekly * duration * 100) / 100

  // 5. Build breakdown
  const breakdown = {
    plan,
    meals,
    days,
    mealPrices: mealPrices.map((m) => ({
      meal: m.meal_type,
      price: parseFloat(String(m.base_price_mad || 0)),
    })),
  }

  return {
    pricePerDay: Math.round(pricePerDay * 100) / 100,
    grossWeekly: Math.round(grossWeekly * 100) / 100,
    discountsApplied,
    finalWeekly: Math.round(finalWeekly * 100) / 100,
    durationWeeks: duration,
    totalRoundedMAD,
    breakdown,
  }
}

/**
 * Validate pricing inputs
 */
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


