// Fitnest.ma Pricing System Implementation
// Updated: Removed days-based discounts, keeping only volume and duration discounts

export interface MealSelection {
  planId: string
  mainMeals: number
  breakfast: boolean
  snacks: number
  selectedDays: Date[]
  subscriptionWeeks?: number
  promoCode?: string
}

export interface PriceBreakdown {
  // Daily breakdown
  dailyBreakdown: {
    mainMeals: number
    breakfast: number
    snacks: number
    dailyTotal: number
  }

  // Weekly breakdown
  weeklyTotals: {
    subtotal: number
    weeklyTotal: number
  }

  // Subscription breakdown
  subscriptionTotals: {
    subscriptionSubtotal: number
  }

  // Discount breakdown
  discounts: {
    appliedWeeklyDiscount: number
    durationDiscount: number
    seasonalDiscount: number
    totalDiscount: number
  }

  // Final totals
  finalTotal: number
  totalWeeks: number
  totalItems: number
  pricePerWeek: number
  pricePerDay: number
}

// Pricing configuration
export const pricingConfig = {
  basePrices: {
    mainMeal: 40, // MAD per main meal
    breakfast: 30, // MAD per breakfast
    snack: 15, // MAD per snack
  },

  planMultipliers: {
    "stay-fit": 0.95, // 5% discount
    "weight-loss": 1.0, // Base price
    "muscle-gain": 1.15, // 15% premium
    keto: 1.1, // 10% premium
  },

  // Volume discounts based on total items per week
  volumeDiscounts: {
    totalItems: [
      { min: 6, max: 13, discount: 0 }, // 0% for 6-13 items
      { min: 14, max: 20, discount: 0.05 }, // 5% for 14-20 items
      { min: 21, max: 35, discount: 0.1 }, // 10% for 21-35 items
      { min: 36, max: 999, discount: 0.15 }, // 15% for 36+ items
    ],
  },

  // Duration discounts
  durationDiscounts: {
    1: 0, // 1 week: 0%
    2: 0.05, // 2 weeks: 5%
    4: 0.1, // 1 month: 10%
  },

  // Seasonal/promotional discounts
  seasonalDiscounts: {
    "NEW-CUSTOMER": 0.2,
    RAMADAN: 0.15,
    SUMMER: 0.1,
    "BULK-ORDER": 0.25,
  },
}

// Validation function - UPDATED: Removed old per-week limits
export function validateMealSelection(selection: MealSelection): string[] {
  const errors: string[] = []

  // Check minimum meal requirement
  const totalMeals = selection.mainMeals + (selection.breakfast ? 1 : 0)
  if (totalMeals < 2) {
    errors.push("Must select at least 2 meals per day")
  }

  // Check valid meal combinations
  const validCombinations = [
    { mainMeals: 1, breakfast: true }, // 1 main + 1 breakfast
    { mainMeals: 2, breakfast: false }, // 2 main meals
    { mainMeals: 2, breakfast: true }, // 2 main + 1 breakfast
  ]

  const isValidCombination = validCombinations.some(
    (combo) => combo.mainMeals === selection.mainMeals && combo.breakfast === selection.breakfast,
  )

  if (!isValidCombination) {
    errors.push("Invalid meal combination")
  }

  // Check minimum days - UPDATED: Use business logic instead of per-week limits
  const subscriptionWeeks = selection.subscriptionWeeks || 1
  const totalDays = selection.selectedDays.length

  if (subscriptionWeeks === 1) {
    if (totalDays < 3) {
      errors.push("Must select at least 3 days for a 1-week subscription")
    }
  } else if (subscriptionWeeks === 2) {
    if (totalDays < 6) {
      errors.push("Must select at least 6 days for a 2-week subscription")
    }
  } else if (subscriptionWeeks === 4) {
    if (totalDays < 10) {
      errors.push("Must select at least 10 days for a 1-month subscription")
    }
  }

  // Check valid plan
  if (!pricingConfig.planMultipliers[selection.planId]) {
    errors.push("Invalid meal plan selected")
  }

  return errors
}

// Calculate adjusted meal prices based on plan
export function calculateAdjustedPrices(planId: string) {
  const multiplier = pricingConfig.planMultipliers[planId] || 1.0

  return {
    mainMeal: pricingConfig.basePrices.mainMeal * multiplier,
    breakfast: pricingConfig.basePrices.breakfast * multiplier,
    snack: pricingConfig.basePrices.snack, // Snacks don't get plan multipliers
  }
}

// Get volume-based discount
export function getVolumeDiscount(totalItems: number): number {
  const tier = pricingConfig.volumeDiscounts.totalItems.find((tier) => totalItems >= tier.min && totalItems <= tier.max)
  return tier?.discount || 0
}

// Get duration-based discount
export function getDurationDiscount(weeks: number): number {
  return pricingConfig.durationDiscounts[weeks] || 0
}

// Get seasonal discount
export function getSeasonalDiscount(promoCode?: string): number {
  if (!promoCode) return 0
  return pricingConfig.seasonalDiscounts[promoCode.toUpperCase()] || 0
}

// Main pricing calculation function
export function calculatePrice(selection: MealSelection, seasonalCode?: string): PriceBreakdown {
  // Validate input
  const errors = validateMealSelection(selection)
  if (errors.length > 0) {
    throw new Error(`Invalid selection: ${errors.join(", ")}`)
  }

  // Calculate adjusted prices
  const adjustedPrices = calculateAdjustedPrices(selection.planId)

  // Calculate daily breakdown
  const dailyMainMeals = selection.mainMeals * adjustedPrices.mainMeal
  const dailyBreakfast = selection.breakfast ? adjustedPrices.breakfast : 0
  const dailySnacks = selection.snacks * adjustedPrices.snack
  const dailyTotal = dailyMainMeals + dailyBreakfast + dailySnacks

  // Calculate total for all selected days (not weekly averages)
  const totalDays = selection.selectedDays.length
  const totalSubtotal = dailyTotal * totalDays

  // Calculate total items for the entire subscription
  const itemsPerDay = selection.mainMeals + (selection.breakfast ? 1 : 0) + selection.snacks
  const totalItems = itemsPerDay * totalDays

  // Calculate discounts
  const volumeDiscount = getVolumeDiscount(totalItems)
  const seasonalDiscount = getSeasonalDiscount(seasonalCode)

  // Apply best discount (volume vs seasonal)
  const bestDiscount = Math.max(volumeDiscount, seasonalDiscount)
  const appliedWeeklyDiscount = bestDiscount
  const discountAmount = totalSubtotal * appliedWeeklyDiscount
  const subtotalAfterDiscount = totalSubtotal - discountAmount

  // Calculate subscription totals
  const subscriptionWeeks = selection.subscriptionWeeks || 1

  // Apply duration discount
  const durationDiscountRate = getDurationDiscount(subscriptionWeeks)
  const durationDiscountAmount = subtotalAfterDiscount * durationDiscountRate

  // Calculate final total
  const finalTotal = subtotalAfterDiscount - durationDiscountAmount

  // Calculate total discount amount
  const totalDiscountAmount = discountAmount + durationDiscountAmount

  return {
    dailyBreakdown: {
      mainMeals: Math.round(dailyMainMeals * 100) / 100,
      breakfast: Math.round(dailyBreakfast * 100) / 100,
      snacks: Math.round(dailySnacks * 100) / 100,
      dailyTotal: Math.round(dailyTotal * 100) / 100,
    },

    weeklyTotals: {
      subtotal: Math.round(totalSubtotal * 100) / 100,
      weeklyTotal: Math.round(subtotalAfterDiscount * 100) / 100,
    },

    subscriptionTotals: {
      subscriptionSubtotal: Math.round(subtotalAfterDiscount * 100) / 100,
    },

    discounts: {
      appliedWeeklyDiscount: Math.round(appliedWeeklyDiscount * 10000) / 100, // Convert to percentage
      durationDiscount: Math.round(durationDiscountAmount * 100) / 100,
      seasonalDiscount: seasonalDiscount > 0 ? Math.round(discountAmount * 100) / 100 : 0,
      totalDiscount: Math.round(totalDiscountAmount * 100) / 100,
    },

    finalTotal: Math.round(finalTotal * 100) / 100,
    totalWeeks: subscriptionWeeks,
    totalItems: totalItems,
    pricePerWeek: Math.round((finalTotal / subscriptionWeeks) * 100) / 100,
    pricePerDay: Math.round((finalTotal / totalDays) * 100) / 100,
  }
}

// Helper functions for display
export function formatPrice(amount: number, currency = "MAD"): string {
  return `${amount.toFixed(2)} ${currency}`
}

export function getPlanDisplayName(planId: string): string {
  const names: Record<string, string> = {
    "stay-fit": "Stay Fit",
    "weight-loss": "Weight Loss",
    "muscle-gain": "Muscle Gain",
    keto: "Keto",
  }
  return names[planId] || planId
}

// Export for backward compatibility
export type { PriceBreakdown as PricingResult }
