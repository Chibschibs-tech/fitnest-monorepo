import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mealType = searchParams.get("type")
    const planId = searchParams.get("plan_id")

    let meals
    if (planId) {
      // Get meals for a specific meal plan
      meals = await sql`
        SELECT DISTINCT
          m.id,
          m.slug,
          m.title as name,
          m.description,
          m.meal_type,
          m.kcal as calories,
          m.protein,
          m.carbs,
          m.fat,
          m.fiber,
          m.sodium,
          m.sugar,
          m.image_url,
          m.tags,
          m.allergens,
          m.published as is_active
        FROM meals m
        INNER JOIN meal_plan_meals mpm ON m.id = mpm.meal_id
        INNER JOIN plan_variants pv ON mpm.plan_variant_id = pv.id
        WHERE pv.meal_plan_id = ${planId}::integer
          AND m.published = true
          ${mealType && mealType !== "all" ? sql`AND m.meal_type = ${mealType}` : sql``}
        ORDER BY m.meal_type ASC, m.title ASC
      `
    } else if (mealType && mealType !== "all") {
      meals = await sql`
        SELECT 
          id,
          slug,
          title as name,
          description,
          meal_type,
          kcal as calories,
          protein,
          carbs,
          fat,
          fiber,
          sodium,
          sugar,
          image_url,
          tags,
          allergens,
          published as is_active
        FROM meals
        WHERE meal_type = ${mealType}
          AND published = true
        ORDER BY title ASC
      `
    } else {
      meals = await sql`
        SELECT 
          id,
          slug,
          title as name,
          description,
          meal_type,
          kcal as calories,
          protein,
          carbs,
          fat,
          fiber,
          sodium,
          sugar,
          image_url,
          tags,
          allergens,
          published as is_active
        FROM meals
        WHERE published = true
        ORDER BY meal_type ASC, title ASC
      `
    }

    return NextResponse.json(
      meals.map((meal: any) => ({
        id: meal.id,
        name: meal.name,
        description: meal.description,
        mealType: meal.meal_type,
        imageUrl: meal.image_url,
        tags: meal.tags || [],
        allergens: meal.allergens || [],
        isActive: meal.is_active,
        calories: Number(meal.calories) || 0,
        protein: Number(meal.protein) || 0,
        carbs: Number(meal.carbs) || 0,
        fat: Number(meal.fat) || 0,
        fiber: Number(meal.fiber) || 0,
        sugar: Number(meal.sugar) || 0,
        sodium: Number(meal.sodium) || 0,
      })),
    )
  } catch (error) {
    console.error("Error fetching meals:", error)
    return NextResponse.json([], { status: 500 })
  }
}
