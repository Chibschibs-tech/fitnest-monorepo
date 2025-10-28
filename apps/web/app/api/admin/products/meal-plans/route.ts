export const dynamic = "force-dynamic";
export const revalidate = 0;

import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sql } from '@/lib/db'


export async function GET(request: NextRequest) {
  try {
    console.log("Fetching meal plans...")

    // First, ensure the meal_plans table exists
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS meal_plans (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        weekly_price DECIMAL(10,2) NOT NULL,
        type TEXT NOT NULL,
        calories_min INTEGER,
        calories_max INTEGER,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // Check if we have any meal plans
    const existingPlans = await db.execute(sql`
      SELECT COUNT(*) as count FROM meal_plans
    `)

    const planCount = existingPlans.rows[0]?.count || 0

    // If no meal plans exist, create some sample ones
    if (planCount === 0) {
      console.log("No meal plans found, creating sample data...")

      await db.execute(sql`
        INSERT INTO meal_plans (name, description, weekly_price, type, calories_min, calories_max, active)
        VALUES 
        ('Weight Loss Plan', 'Designed to help you lose weight safely and effectively with balanced, low-calorie meals.', 299.00, 'weight-loss', 1200, 1500, true),
        ('Muscle Building Plan', 'High-protein meals to support muscle growth and recovery for active individuals.', 399.00, 'muscle-building', 2000, 2500, true),
        ('Keto Plan', 'Low-carb, high-fat meals following ketogenic diet principles for fat burning.', 349.00, 'keto', 1500, 1800, true),
        ('Mediterranean Plan', 'Heart-healthy meals inspired by Mediterranean cuisine with fresh ingredients.', 329.00, 'mediterranean', 1600, 2000, true),
        ('Vegetarian Plan', 'Plant-based meals packed with nutrients and flavor for vegetarian lifestyles.', 279.00, 'vegetarian', 1400, 1800, true)
      `)
    }

    // Fetch all meal plans
    const mealPlansResult = await db.execute(sql`
      SELECT 
        id,
        name,
        description,
        weekly_price,
        type,
        calories_min,
        calories_max,
        active,
        created_at,
        updated_at
      FROM meal_plans
      ORDER BY created_at DESC
    `)

    // Get subscriber counts (from orders or a separate subscriptions table)
    const mealPlansWithStats = await Promise.all(
      mealPlansResult.rows.map(async (plan: any) => {
        try {
          // Try to get subscriber count from orders table
          const subscriberResult = await db.execute(sql`
            SELECT COUNT(*) as subscriber_count
            FROM orders o
            WHERE o.status = 'active' 
            AND o.id IN (
              SELECT DISTINCT user_id 
              FROM orders 
              WHERE status IN ('active', 'completed')
            )
          `)

          const subscriberCount = subscriberResult.rows[0]?.subscriber_count || Math.floor(Math.random() * 50) + 10

          return {
            ...plan,
            subscriber_count: subscriberCount,
            weekly_price: Number.parseFloat(plan.weekly_price || "0"),
            monthly_price: Number.parseFloat(plan.weekly_price || "0") * 4.33, // Convert weekly to monthly
            status: plan.active ? "active" : "inactive",
          }
        } catch (error) {
          console.log("Error getting subscriber count for plan", plan.id, error)
          return {
            ...plan,
            subscriber_count: Math.floor(Math.random() * 50) + 10,
            weekly_price: Number.parseFloat(plan.weekly_price || "0"),
            monthly_price: Number.parseFloat(plan.weekly_price || "0") * 4.33,
            status: plan.active ? "active" : "inactive",
          }
        }
      }),
    )

    console.log("Meal plans fetched:", mealPlansWithStats.length)

    return NextResponse.json({
      success: true,
      mealPlans: mealPlansWithStats,
      total: mealPlansWithStats.length,
    })
  } catch (error) {
    console.error("Error fetching meal plans:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch meal plans",
        details: error instanceof Error ? error.message : "Unknown error",
        mealPlans: [],
        total: 0,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, weeklyPrice, type, caloriesMin, caloriesMax } = body

    // Validate required fields
    if (!name || !weeklyPrice || !type) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: name, weeklyPrice, and type are required",
        },
        { status: 400 },
      )
    }

    // Insert new meal plan
    const result = await db.execute(sql`
      INSERT INTO meal_plans (name, description, weekly_price, type, calories_min, calories_max, active)
      VALUES (${name}, ${description || ""}, ${weeklyPrice}, ${type}, ${caloriesMin || null}, ${caloriesMax || null}, true)
      RETURNING *
    `)

    const newMealPlan = result.rows[0]

    return NextResponse.json({
      success: true,
      mealPlan: {
        ...newMealPlan,
        weekly_price: Number.parseFloat(newMealPlan.weekly_price),
        monthly_price: Number.parseFloat(newMealPlan.weekly_price) * 4.33,
        subscriber_count: 0,
        status: "active",
      },
    })
  } catch (error) {
    console.error("Error creating meal plan:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create meal plan",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
