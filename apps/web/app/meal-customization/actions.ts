"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { getServerSession } from "next-auth/next"
import { db, mealPreferences } from "@/lib/db"
import { eq } from "drizzle-orm"

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

    // Stringify arrays for storage
    const preferencesToStore = {
      ...preferences,
      dietaryPreferences: JSON.stringify(preferences.dietaryPreferences || []),
      allergies: JSON.stringify(preferences.allergies || []),
      excludedIngredients: JSON.stringify(preferences.excludedIngredients || []),
    }

    // Check if user already has preferences
    const existingPreferences = await db
      .select()
      .from(mealPreferences)
      .where(eq(mealPreferences.userId, userId))
      .limit(1)

    if (existingPreferences.length > 0) {
      // Update existing preferences
      await db
        .update(mealPreferences)
        .set({
          planType: preferencesToStore.planType,
          calorieTarget: preferencesToStore.calorieTarget,
          mealsPerDay: preferencesToStore.mealsPerDay,
          daysPerWeek: preferencesToStore.daysPerWeek,
          dietaryPreferences: preferencesToStore.dietaryPreferences,
          allergies: preferencesToStore.allergies,
          excludedIngredients: preferencesToStore.excludedIngredients,
          updatedAt: new Date(),
        })
        .where(eq(mealPreferences.userId, userId))
    } else {
      // Insert new preferences
      await db.insert(mealPreferences).values({
        userId,
        planType: preferencesToStore.planType,
        calorieTarget: preferencesToStore.calorieTarget,
        mealsPerDay: preferencesToStore.mealsPerDay,
        daysPerWeek: preferencesToStore.daysPerWeek,
        dietaryPreferences: preferencesToStore.dietaryPreferences,
        allergies: preferencesToStore.allergies,
        excludedIngredients: preferencesToStore.excludedIngredients,
      })
    }

    // Revalidate the meal plan preview page
    revalidatePath("/meal-plans/preview")

    return { success: true }
  } catch (error) {
    console.error("Error saving meal preferences:", error)
    return { success: false, error: "Failed to save preferences" }
  }
}
