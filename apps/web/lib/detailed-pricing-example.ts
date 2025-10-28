import { calculatePrice, type MealSelection, pricingConfig } from "./pricing-model"

// Detailed example for Muscle Gain customer
export function buildMuscleGainExample() {
  console.log("=== MUSCLE GAIN PRICING EXAMPLE ===\n")

  // Base configuration
  const basePrices = pricingConfig.basePrices
  const muscleGainMultiplier = pricingConfig.planMultipliers["muscle-gain"] // 1.15

  console.log("Base Prices:")
  console.log(`- Main Meal: ${basePrices.mainMeal} MAD`)
  console.log(`- Breakfast: ${basePrices.breakfast} MAD`)
  console.log(`- Snack: ${basePrices.snack} MAD`)
  console.log(`- Muscle Gain Multiplier: ${muscleGainMultiplier}x (15% premium)\n`)

  // Calculate adjusted prices for Muscle Gain plan
  const adjustedMainMeal = basePrices.mainMeal * muscleGainMultiplier // 40 * 1.15 = 46 MAD
  const adjustedBreakfast = basePrices.breakfast * muscleGainMultiplier // 30 * 1.15 = 34.5 MAD
  const snackPrice = basePrices.snack // 15 MAD (no multiplier for snacks)

  console.log("Adjusted Prices for Muscle Gain:")
  console.log(`- Main Meal: ${adjustedMainMeal} MAD`)
  console.log(`- Breakfast: ${adjustedBreakfast} MAD`)
  console.log(`- Snack: ${snackPrice} MAD (no plan multiplier)\n`)

  // Customer selection: 2 main meals + 1 breakfast + 1 snack
  const dailyMealCost = adjustedMainMeal * 2 + adjustedBreakfast + snackPrice
  console.log("Daily Meal Breakdown:")
  console.log(`- 2 Main Meals: 2 × ${adjustedMainMeal} = ${adjustedMainMeal * 2} MAD`)
  console.log(`- 1 Breakfast: 1 × ${adjustedBreakfast} = ${adjustedBreakfast} MAD`)
  console.log(`- 1 Snack: 1 × ${snackPrice} = ${snackPrice} MAD`)
  console.log(`- Daily Total: ${dailyMealCost} MAD per day\n`)

  // Now let's show pricing for different day scenarios
  const dayScenarios = [3, 4, 5, 6, 7]

  console.log("=== PRICING BY NUMBER OF DAYS ===\n")

  dayScenarios.forEach((days) => {
    console.log(`--- ${days} DAYS SCENARIO ---`)

    // Create selection object
    const selection: MealSelection = {
      planId: "muscle-gain",
      mainMeals: 2,
      breakfast: true,
      snacks: 1,
      selectedDays: Array.from({ length: days }, (_, i) => new Date(`2024-01-0${i + 1}`)),
    }

    const pricing = calculatePrice(selection)

    console.log(`Subtotal: ${days} days × ${dailyMealCost} MAD = ${pricing.weeklyTotals.subtotal} MAD`)
    console.log(`Total Items: ${pricing.totalItems} items (${days} days × 4 items per day)`)

    // Determine which discount applies
    const daysDiscount =
      pricingConfig.volumeDiscounts.days.find((tier) => days >= tier.min && days <= tier.max)?.discount || 0

    const volumeDiscount =
      pricingConfig.volumeDiscounts.totalItems.find(
        (tier) => pricing.totalItems >= tier.min && pricing.totalItems <= tier.max,
      )?.discount || 0

    const bestDiscount = Math.max(daysDiscount, volumeDiscount)
    const discountAmount = pricing.weeklyTotals.subtotal * bestDiscount

    console.log(
      `Days Discount: ${daysDiscount * 100}% (${daysDiscount > 0 ? `${(pricing.weeklyTotals.subtotal * daysDiscount).toFixed(2)} MAD` : "No discount"})`,
    )
    console.log(
      `Volume Discount: ${volumeDiscount * 100}% (${volumeDiscount > 0 ? `${(pricing.weeklyTotals.subtotal * volumeDiscount).toFixed(2)} MAD` : "No discount"})`,
    )
    console.log(`Applied Discount: ${bestDiscount * 100}% (${discountAmount.toFixed(2)} MAD)`)
    console.log(`Final Total: ${pricing.finalTotal} MAD`)
    console.log(`Price per Day: ${pricing.pricePerDay} MAD`)
    console.log(
      `Savings vs 3 days: ${days > 3 ? `${(dailyMealCost * days - pricing.finalTotal).toFixed(2)} MAD` : "Base price"}`,
    )
    console.log("")
  })

  return {
    dailyMealCost,
    adjustedPrices: {
      mainMeal: adjustedMainMeal,
      breakfast: adjustedBreakfast,
      snack: snackPrice,
    },
  }
}

// Function to show discount tiers clearly
export function explainDiscountLogic() {
  console.log("=== DISCOUNT LOGIC EXPLANATION ===\n")

  console.log("1. DAYS-BASED DISCOUNTS:")
  pricingConfig.volumeDiscounts.days.forEach((tier) => {
    console.log(`   ${tier.min}-${tier.max} days: ${tier.discount * 100}% discount`)
  })

  console.log("\n2. VOLUME-BASED DISCOUNTS (Total Items):")
  pricingConfig.volumeDiscounts.totalItems.forEach((tier) => {
    console.log(`   ${tier.min}-${tier.max === 999 ? "∞" : tier.max} items: ${tier.discount * 100}% discount`)
  })

  console.log("\n3. DISCOUNT APPLICATION RULE:")
  console.log("   - Only the BEST discount is applied (no stacking)")
  console.log("   - System compares days discount vs volume discount")
  console.log("   - Customer gets whichever is higher")

  console.log("\n4. ITEMS CALCULATION:")
  console.log("   - Items per day = Main Meals + Breakfast + Snacks")
  console.log("   - Total items = Items per day × Number of days")
  console.log("   - Example: (2 main + 1 breakfast + 1 snack) × 5 days = 20 items")
}
