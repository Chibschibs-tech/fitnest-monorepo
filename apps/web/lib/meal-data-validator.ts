import { calculateMealNutrition, type MealIngredient } from "./macro-calculator"
import { getIngredient } from "./ingredients-db"

export interface MealValidationResult {
  isValid: boolean
  issues: string[]
  suggestions: string[]
  calculatedNutrition?: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
}

/**
 * Validate a meal's ingredient list and nutrition calculations
 */
export function validateMeal(meal: {
  name: string
  ingredients?: MealIngredient[]
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
}): MealValidationResult {
  const issues: string[] = []
  const suggestions: string[] = []

  // Check if ingredients exist
  if (!meal.ingredients || meal.ingredients.length === 0) {
    issues.push("No ingredients defined")
    return { isValid: false, issues, suggestions }
  }

  // Validate each ingredient exists in database
  const invalidIngredients = meal.ingredients.filter((ing) => !getIngredient(ing.ingredientId))

  if (invalidIngredients.length > 0) {
    issues.push(`Invalid ingredients: ${invalidIngredients.map((ing) => ing.ingredientId).join(", ")}`)
  }

  // Calculate nutrition from ingredients
  const calculatedNutrition = calculateMealNutrition(meal.ingredients)

  // Compare with hardcoded values if they exist
  if (meal.calories !== undefined) {
    const calorieDiff = Math.abs(meal.calories - calculatedNutrition.calories)
    const caloriePercentDiff = (calorieDiff / meal.calories) * 100

    if (caloriePercentDiff > 10) {
      issues.push(
        `Calorie mismatch: hardcoded ${meal.calories} vs calculated ${calculatedNutrition.calories} (${caloriePercentDiff.toFixed(1)}% difference)`,
      )
      suggestions.push(`Update calories to ${calculatedNutrition.calories}`)
    }
  }

  if (meal.protein !== undefined) {
    const proteinDiff = Math.abs(meal.protein - calculatedNutrition.protein)
    if (proteinDiff > 2) {
      issues.push(`Protein mismatch: hardcoded ${meal.protein}g vs calculated ${calculatedNutrition.protein}g`)
      suggestions.push(`Update protein to ${calculatedNutrition.protein}g`)
    }
  }

  // Nutritional quality checks
  if (calculatedNutrition.calories > 0) {
    const proteinPercent = ((calculatedNutrition.protein * 4) / calculatedNutrition.calories) * 100

    if (proteinPercent < 15) {
      suggestions.push(`Consider adding more protein (currently ${proteinPercent.toFixed(1)}% of calories)`)
    }

    if (calculatedNutrition.sodium > 800) {
      suggestions.push(`High sodium content: ${calculatedNutrition.sodium}mg`)
    }

    if (calculatedNutrition.fiber < 3) {
      suggestions.push(`Low fiber content: ${calculatedNutrition.fiber}g`)
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
    suggestions,
    calculatedNutrition,
  }
}

/**
 * Generate corrected meal data with calculated nutrition
 */
export function generateCorrectedMealData(meal: {
  name: string
  ingredients: MealIngredient[]
  [key: string]: any
}) {
  const nutrition = calculateMealNutrition(meal.ingredients)

  return {
    ...meal,
    calories: nutrition.calories,
    protein: nutrition.protein,
    carbs: nutrition.carbs,
    fat: nutrition.fat,
    fiber: nutrition.fiber,
    sugar: nutrition.sugar,
    sodium: nutrition.sodium,
  }
}

/**
 * Batch validate multiple meals
 */
export function validateMealPlan(meals: any[]): {
  totalIssues: number
  mealResults: Array<{ meal: any; validation: MealValidationResult }>
} {
  const results = meals.map((meal) => ({
    meal,
    validation: validateMeal(meal),
  }))

  const totalIssues = results.reduce((sum, result) => sum + result.validation.issues.length, 0)

  return {
    totalIssues,
    mealResults: results,
  }
}
