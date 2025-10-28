export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { INGREDIENTS_DB } from "@/lib/ingredients-db"

export async function POST() {
  const results = []
  const errors = []

  // Common ingredients to verify first
  const priorityIngredients = [
    "chicken-breast",
    "salmon-fillet",
    "quinoa-cooked",
    "brown-rice-cooked",
    "sweet-potato",
    "broccoli",
    "spinach",
    "olive-oil",
    "almonds",
    "greek-yogurt",
  ]

  for (const ingredientId of priorityIngredients) {
    const ingredient = INGREDIENTS_DB[ingredientId]
    if (!ingredient) continue

    try {
      // Search for the ingredient in USDA database
      const searchResponse = await fetch(`/api/nutrition-lookup?query=${encodeURIComponent(ingredient.name)}`)
      const searchData = await searchResponse.json()

      if (searchData.status === "success" && searchData.data.length > 0) {
        const bestMatch = searchData.data[0] // Take the first result

        // Calculate accuracy
        const accuracy = {
          calories: (Math.abs(ingredient.calories - bestMatch.nutrition.calories) / bestMatch.nutrition.calories) * 100,
          protein: (Math.abs(ingredient.protein - bestMatch.nutrition.protein) / bestMatch.nutrition.protein) * 100,
          carbs:
            bestMatch.nutrition.carbs > 0
              ? (Math.abs(ingredient.carbs - bestMatch.nutrition.carbs) / bestMatch.nutrition.carbs) * 100
              : 0,
          fat: (Math.abs(ingredient.fat - bestMatch.nutrition.fat) / bestMatch.nutrition.fat) * 100,
        }

        results.push({
          ingredientId,
          name: ingredient.name,
          currentData: {
            calories: ingredient.calories,
            protein: ingredient.protein,
            carbs: ingredient.carbs,
            fat: ingredient.fat,
          },
          usdaData: bestMatch.nutrition,
          fdcId: bestMatch.fdcId,
          accuracy,
          isAccurate: Object.values(accuracy).every((diff) => diff < 10), // Within 10%
          recommendation: Object.values(accuracy).some((diff) => diff > 15) ? "update_recommended" : "current_ok",
        })
      } else {
        errors.push({
          ingredientId,
          name: ingredient.name,
          error: "No USDA match found",
        })
      }

      // Add delay to respect API rate limits
      await new Promise((resolve) => setTimeout(resolve, 100))
    } catch (error) {
      errors.push({
        ingredientId,
        name: ingredient.name,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  const summary = {
    total: results.length,
    accurate: results.filter((r) => r.isAccurate).length,
    needsUpdate: results.filter((r) => r.recommendation === "update_recommended").length,
    errors: errors.length,
  }

  return NextResponse.json({
    status: "success",
    summary,
    results,
    errors,
    recommendations: [
      `${summary.accurate}/${summary.total} ingredients are accurate (±10%)`,
      `${summary.needsUpdate} ingredients should be updated`,
      "Consider updating ingredients with >15% variance",
      "Run this verification monthly to maintain accuracy",
    ],
  })
}
