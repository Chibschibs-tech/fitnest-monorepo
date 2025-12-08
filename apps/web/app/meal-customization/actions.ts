"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { getServerSession } from "next-auth/next"
import { sql } from "@/lib/db"

export type MealPreferences = {
  planType: string
  calorieTarget: number
  mealsPerDay: number
  daysPerWeek: number
  dietaryPreferences: string[]
  allergies: string[]
  excludedIngredients: string[]
}

export async function saveMealPreferences(preferences: MealPreferences) {
  try {
    const session = await getServerSession()

    // For non-authenticated users, save to cookies
    if (!session || !session.user) {
      const preferencesJson = JSON.stringify(preferences)

      // Save to cookies
      cookies().set("meal_preferences", preferencesJson, {
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      })

      // Revalidate the meal plan preview page
      revalidatePath("/meal-plans/preview")

      return { success: true }
    }

    // For authenticated users, save to database
    const userId = Number.parseInt(session.user.id as string)

    // Ensure meal_preferences table exists (matches bootstrap schema)
    await sql`
      CREATE TABLE IF NOT EXISTS meal_preferences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        plan_type VARCHAR(100),
        calorie_target INTEGER,
        meals_per_day INTEGER,
        days_per_week INTEGER,
        dietary_preferences TEXT,
        allergies TEXT,
        excluded_ingredients TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `

    // Stringify arrays for storage
    const dietaryPreferencesJson = JSON.stringify(preferences.dietaryPreferences || [])
    const allergiesJson = JSON.stringify(preferences.allergies || [])
    const excludedIngredientsJson = JSON.stringify(preferences.excludedIngredients || [])

    // Check if user already has preferences
    const existingPreferences = await sql`
      SELECT id FROM meal_preferences WHERE user_id = ${userId} LIMIT 1
    `

    if (existingPreferences.length > 0) {
      // Update existing preferences
      await sql`
        UPDATE meal_preferences
        SET 
          plan_type = ${preferences.planType},
          calorie_target = ${preferences.calorieTarget},
          meals_per_day = ${preferences.mealsPerDay},
          days_per_week = ${preferences.daysPerWeek},
          dietary_preferences = ${dietaryPreferencesJson},
          allergies = ${allergiesJson},
          excluded_ingredients = ${excludedIngredientsJson},
          updated_at = NOW()
        WHERE user_id = ${userId}
      `
    } else {
      // Insert new preferences
      await sql`
        INSERT INTO meal_preferences (
          user_id, plan_type, calorie_target, meals_per_day, days_per_week,
          dietary_preferences, allergies, excluded_ingredients
        )
        VALUES (
          ${userId},
          ${preferences.planType},
          ${preferences.calorieTarget},
          ${preferences.mealsPerDay},
          ${preferences.daysPerWeek},
          ${dietaryPreferencesJson},
          ${allergiesJson},
          ${excludedIngredientsJson}
        )
      `
    }

    // Revalidate the meal plan preview page
    revalidatePath("/meal-plans/preview")

    return { success: true }
  } catch (error) {
    console.error("Error saving meal preferences:", error)
    return { success: false, error: "Failed to save preferences" }
  }
}
