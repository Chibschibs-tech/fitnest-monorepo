export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { validateMeal, generateCorrectedMealData } from "@/lib/meal-data-validator"
import { calculateMealNutrition, type MealIngredient } from "@/lib/macro-calculator"

// Sample meal data with ingredients for testing
const sampleMeals = [
  {
    name: "Turkey and Spinach Wrap",
    ingredients: [
      { ingredientId: "whole-wheat-tortilla", amount: 70, displayText: "1 large whole wheat tortilla (~70g)" },
      { ingredientId: "turkey-ground-lean", amount: 100, displayText: "3.5 oz lean ground turkey (~100g)" },
      { ingredientId: "spinach", amount: 30, displayText: "1 cup fresh spinach (~30g)" },
      { ingredientId: "bell-peppers", amount: 50, displayText: "1/4 cup diced bell peppers (~50g)" },
      { ingredientId: "avocado", amount: 40, displayText: "1/4 medium avocado (~40g)" },
      { ingredientId: "greek-yogurt", amount: 30, displayText: "2 tbsp Greek yogurt (~30g)" },
    ] as MealIngredient[],
    // Old hardcoded values for comparison
    oldCalories: 750,
    oldProtein: 35,
    oldCarbs: 45,
    oldFat: 20,
  },
  {
    name: "Grilled Chicken & Vegetable Medley",
    ingredients: [
      { ingredientId: "chicken-breast", amount: 120, displayText: "4 oz grilled chicken breast (~120g)" },
      { ingredientId: "broccoli", amount: 150, displayText: "1 cup steamed broccoli (~150g)" },
      { ingredientId: "carrots", amount: 80, displayText: "1/2 cup roasted carrots (~80g)" },
      { ingredientId: "quinoa-cooked", amount: 100, displayText: "1/2 cup cooked quinoa (~100g)" },
      { ingredientId: "olive-oil", amount: 10, displayText: "2 tsp olive oil (~10g)" },
    ] as MealIngredient[],
    oldCalories: 420,
    oldProtein: 35,
    oldCarbs: 30,
    oldFat: 15,
  },
]

export async function GET() {
  try {
    const validationResults = []

    for (const meal of sampleMeals) {
      // Calculate current nutrition
      const calculatedNutrition = calculateMealNutrition(meal.ingredients)

      // Validate against old values
      const validation = validateMeal({
        name: meal.name,
        ingredients: meal.ingredients,
        calories: meal.oldCalories,
        protein: meal.oldProtein,
        carbs: meal.oldCarbs,
        fat: meal.oldFat,
      })

      // Generate corrected data
      const correctedMeal = generateCorrectedMealData(meal)

      validationResults.push({
        mealName: meal.name,
        oldNutrition: {
          calories: meal.oldCalories,
          protein: meal.oldProtein,
          carbs: meal.oldCarbs,
          fat: meal.oldFat,
        },
        calculatedNutrition,
        validation,
        correctedMeal: {
          calories: correctedMeal.calories,
          protein: correctedMeal.protein,
          carbs: correctedMeal.carbs,
          fat: correctedMeal.fat,
          fiber: correctedMeal.fiber,
          sodium: correctedMeal.sodium,
        },
      })
    }

    return NextResponse.json({
      status: "success",
      message: "Meal validation completed",
      results: validationResults,
      summary: {
        totalMeals: sampleMeals.length,
        mealsWithIssues: validationResults.filter((r) => !r.validation.isValid).length,
        totalIssues: validationResults.reduce((sum, r) => sum + r.validation.issues.length, 0),
      },
    })
  } catch (error) {
    console.error("Error validating meals:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
