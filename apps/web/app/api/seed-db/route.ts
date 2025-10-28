export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sql } from "drizzle-orm"

export async function GET() {
  try {
    // Check if we already have meal plans
    const existingPlans = await db.execute(sql`SELECT COUNT(*) FROM meal_plans`)
    const planCount = Number.parseInt(existingPlans.rows[0].count || "0")

    if (planCount > 0) {
      return NextResponse.json({
        status: "success",
        message: "Sample data already exists",
        count: planCount,
      })
    }

    // Add sample meal plans
    await db.execute(sql`
      INSERT INTO meal_plans (name, description, weekly_price, type, calories_min, calories_max, active)
      VALUES 
        ('Weight Loss Plan', 'Perfect for those looking to shed some pounds while enjoying delicious meals.', 249, 'weight_loss', 1200, 1500, true),
        ('Muscle Gain Plan', 'High protein meals designed to support muscle growth and recovery.', 299, 'muscle_gain', 2000, 2500, true),
        ('Balanced Nutrition', 'Well-balanced meals with perfect macronutrient distribution.', 199, 'balanced', 1600, 1900, true)
      ON CONFLICT DO NOTHING
    `)

    // Add sample meals (simplified to avoid circular references)
    await db.execute(sql`
      INSERT INTO meals (name, description, calories, protein, carbs, fat, image_url, category)
      VALUES 
        ('Grilled Chicken Bowl', 'Grilled chicken with quinoa and vegetables', 450, 35, 40, 15, '/grilled-chicken-vegetable-medley.png', 'protein'),
        ('Salmon Quinoa Plate', 'Pan-seared salmon with quinoa and greens', 520, 32, 45, 20, '/pan-seared-salmon-quinoa.png', 'protein'),
        ('Vegetable Stir Fry', 'Fresh vegetables stir fried with tofu', 380, 15, 50, 12, '/vibrant-vegetable-stir-fry.png', 'vegetarian')
      ON CONFLICT DO NOTHING
    `)

    return NextResponse.json({
      status: "success",
      message: "Sample data added successfully",
    })
  } catch (error) {
    console.error("Error adding sample data:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
