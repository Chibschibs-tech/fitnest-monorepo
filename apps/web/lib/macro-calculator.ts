import { getIngredient, type Ingredient } from "./ingredients-db"

export interface MealIngredient {
  ingredientId: string
  amount: number // in grams
  unit?: string // for display purposes
  displayText?: string // e.g., "1 large (~70g)"
}

export interface CalculatedNutrition {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sugar: number
  sodium: number
}

export interface DetailedNutrition extends CalculatedNutrition {
  ingredients: Array<{
    ingredient: Ingredient
    amount: number
    nutrition: CalculatedNutrition
  }>
}

/**
 * Calculate nutrition for a single ingredient based on amount
 */
export function calculateIngredientNutrition(ingredientId: string, amountInGrams: number): CalculatedNutrition | null {
  const ingredient = getIngredient(ingredientId)
  if (!ingredient) return null

  const multiplier = amountInGrams / 100 // Convert from per-100g to actual amount

  return {
    calories: Math.round(ingredient.calories * multiplier),
    protein: Math.round(ingredient.protein * multiplier * 10) / 10,
    carbs: Math.round(ingredient.carbs * multiplier * 10) / 10,
    fat: Math.round(ingredient.fat * multiplier * 10) / 10,
    fiber: Math.round(ingredient.fiber * multiplier * 10) / 10,
    sugar: Math.round(ingredient.sugar * multiplier * 10) / 10,
    sodium: Math.round(ingredient.sodium * multiplier),
  }
}

/**
 * Calculate total nutrition for a list of ingredients
 */
export function calculateMealNutrition(ingredients: MealIngredient[]): CalculatedNutrition {
  const totals: CalculatedNutrition = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
  }

  for (const mealIngredient of ingredients) {
    const nutrition = calculateIngredientNutrition(mealIngredient.ingredientId, mealIngredient.amount)

    if (nutrition) {
      totals.calories += nutrition.calories
      totals.protein += nutrition.protein
      totals.carbs += nutrition.carbs
      totals.fat += nutrition.fat
      totals.fiber += nutrition.fiber
      totals.sugar += nutrition.sugar
      totals.sodium += nutrition.sodium
    }
  }

  // Round final totals
  return {
    calories: Math.round(totals.calories),
    protein: Math.round(totals.protein * 10) / 10,
    carbs: Math.round(totals.carbs * 10) / 10,
    fat: Math.round(totals.fat * 10) / 10,
    fiber: Math.round(totals.fiber * 10) / 10,
    sugar: Math.round(totals.sugar * 10) / 10,
    sodium: Math.round(totals.sodium),
  }
}

/**
 * Calculate detailed nutrition with per-ingredient breakdown
 */
export function calculateDetailedNutrition(ingredients: MealIngredient[]): DetailedNutrition {
  const totals = calculateMealNutrition(ingredients)
  const ingredientDetails = []

  for (const mealIngredient of ingredients) {
    const ingredient = getIngredient(mealIngredient.ingredientId)
    const nutrition = calculateIngredientNutrition(mealIngredient.ingredientId, mealIngredient.amount)

    if (ingredient && nutrition) {
      ingredientDetails.push({
        ingredient,
        amount: mealIngredient.amount,
        nutrition,
      })
    }
  }

  return {
    ...totals,
    ingredients: ingredientDetails,
  }
}

/**
 * Scale a recipe by a multiplier (e.g., 1.2 for 20% larger portions)
 */
export function scaleRecipe(ingredients: MealIngredient[], multiplier: number): MealIngredient[] {
  return ingredients.map((ingredient) => ({
    ...ingredient,
    amount: Math.round(ingredient.amount * multiplier * 10) / 10,
  }))
}

/**
 * Adjust recipe to target specific calorie count
 */
export function adjustRecipeForCalories(ingredients: MealIngredient[], targetCalories: number): MealIngredient[] {
  const currentNutrition = calculateMealNutrition(ingredients)
  if (currentNutrition.calories === 0) return ingredients

  const multiplier = targetCalories / currentNutrition.calories
  return scaleRecipe(ingredients, multiplier)
}

/**
 * Get macro distribution as percentages
 */
export function getMacroDistribution(nutrition: CalculatedNutrition): {
  proteinPercent: number
  carbsPercent: number
  fatPercent: number
} {
  const proteinCalories = nutrition.protein * 4
  const carbsCalories = nutrition.carbs * 4
  const fatCalories = nutrition.fat * 9
  const totalCalories = proteinCalories + carbsCalories + fatCalories

  if (totalCalories === 0) {
    return { proteinPercent: 0, carbsPercent: 0, fatPercent: 0 }
  }

  return {
    proteinPercent: Math.round((proteinCalories / totalCalories) * 100),
    carbsPercent: Math.round((carbsCalories / totalCalories) * 100),
    fatPercent: Math.round((fatCalories / totalCalories) * 100),
  }
}

/**
 * Validate if nutrition meets certain criteria
 */
export function validateNutrition(
  nutrition: CalculatedNutrition,
  criteria: {
    minProtein?: number
    maxSodium?: number
    minFiber?: number
  },
): { isValid: boolean; issues: string[] } {
  const issues: string[] = []

  if (criteria.minProtein && nutrition.protein < criteria.minProtein) {
    issues.push(`Protein too low: ${nutrition.protein}g (min: ${criteria.minProtein}g)`)
  }

  if (criteria.maxSodium && nutrition.sodium > criteria.maxSodium) {
    issues.push(`Sodium too high: ${nutrition.sodium}mg (max: ${criteria.maxSodium}mg)`)
  }

  if (criteria.minFiber && nutrition.fiber < criteria.minFiber) {
    issues.push(`Fiber too low: ${nutrition.fiber}g (min: ${criteria.minFiber}g)`)
  }

  return {
    isValid: issues.length === 0,
    issues,
  }
}
