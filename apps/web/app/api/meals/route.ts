import { type NextRequest, NextResponse } from "next/server"
import { sql, db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    // Try different environment variables in order of preference
    const databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL
    
    if (!databaseUrl) {
      throw new Error("No database URL found in environment variables")
    }

    const { searchParams } = new URL(request.url)
    const mealType = searchParams.get("type")

    let meals
    if (mealType && mealType !== "all") {
      meals = await sql`
        SELECT id, name, description, meal_type, image_url
        FROM meals
        WHERE meal_type = ${mealType}
        ORDER BY name ASC
      `
    } else {
      meals = await sql`
        SELECT id, name, description, meal_type, image_url
        FROM meals
        ORDER BY meal_type ASC, name ASC
      `
    }

    return NextResponse.json(
      meals.map((meal) => ({
        id: meal.id,
        name: meal.name,
        description: meal.description,
        mealType: meal.meal_type,
        ingredients: meal.description,
        nutrition: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
        },
        imageUrl: meal.image_url,
        tags: [],
        dietaryInfo: [],
        allergens: [],
        usdaVerified: false,
        isActive: true,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
    )
  } catch (error) {
    console.error("Error fetching meals:", error)
    return NextResponse.json([], { status: 500 })
  }
}
