export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const planId = Number.parseInt(params.id)

    if (isNaN(planId)) {
      return NextResponse.json({ message: "Invalid meal plan ID" }, { status: 400 })
    }

    // Get meal plan details
    const mealPlans = await sql.query(
      `
      SELECT 
        id,
        name,
        description,
        plan_type,
        target_calories_min,
        target_calories_max,
        weekly_price,
        is_active,
        created_at,
        updated_at
      FROM meal_plans 
      WHERE id = $1 AND is_active = true
    `,
      [planId],
    )

    if (mealPlans.length === 0) {
      return NextResponse.json({ message: "Meal plan not found" }, { status: 404 })
    }

    // Get meals in this plan
    const planMeals = await sql.query(
      `
      SELECT 
        mpi.portion_multiplier,
        mpi.meal_type,
        mpi.sort_order,
        m.id,
        m.name,
        m.description,
        m.meal_type as original_meal_type,
        m.ingredients,
        m.nutrition,
        m.image_url,
        m.tags,
        m.dietary_info,
        m.allergens,
        m.usda_verified
      FROM meal_plan_items mpi
      JOIN meals m ON mpi.meal_id = m.id
      WHERE mpi.meal_plan_id = $1 AND m.is_active = true
      ORDER BY mpi.sort_order ASC
    `,
      [planId],
    )

    const plan = mealPlans[0]
    const transformedPlan = {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      planType: plan.plan_type,
      targetCaloriesMin: plan.target_calories_min,
      targetCaloriesMax: plan.target_calories_max,
      weeklyPrice: plan.weekly_price,
      isActive: plan.is_active,
      createdAt: plan.created_at,
      updatedAt: plan.updated_at,
      meals: planMeals.map((meal: any) => ({
        id: meal.id,
        name: meal.name,
        description: meal.description,
        mealType: meal.original_meal_type,
        ingredients: meal.ingredients,
        nutrition: meal.nutrition,
        imageUrl: meal.image_url,
        tags: meal.tags,
        dietaryInfo: meal.dietary_info,
        allergens: meal.allergens,
        usdaVerified: meal.usda_verified,
        portionMultiplier: meal.portion_multiplier,
        sortOrder: meal.sort_order,
        // Adjusted nutrition based on portion multiplier
        calories: Math.round((meal.nutrition?.calories || 0) * meal.portion_multiplier),
        protein: Math.round((meal.nutrition?.protein || 0) * meal.portion_multiplier),
        carbs: Math.round((meal.nutrition?.carbs || 0) * meal.portion_multiplier),
        fat: Math.round((meal.nutrition?.fat || 0) * meal.portion_multiplier),
        fiber: Math.round((meal.nutrition?.fiber || 0) * meal.portion_multiplier),
        sugar: Math.round((meal.nutrition?.sugar || 0) * meal.portion_multiplier),
        sodium: Math.round((meal.nutrition?.sodium || 0) * meal.portion_multiplier),
      })),
    }

    return NextResponse.json(transformedPlan)
  } catch (error) {
    console.error("Error fetching meal plan:", error)
    return NextResponse.json({ message: "Failed to fetch meal plan" }, { status: 500 })
  }
}
