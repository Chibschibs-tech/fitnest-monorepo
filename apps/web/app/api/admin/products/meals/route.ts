import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getSessionUser } from "@/lib/simple-auth"
import { sql, db } from "@/lib/db"


export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const cookieStore = cookies()
    const sessionId = cookieStore.get("session-id")?.value

    if (!sessionId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const user = await getSessionUser(sessionId)

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    console.log("Fetching meals for admin...")

    let meals = []

    try {
      // Try to get meals from the meals table
      const mealsQuery = await sql`
        SELECT 
          id,
          name,
          description,
          price,
          category,
          image_url,
          calories,
          protein,
          carbs,
          fat,
          fiber,
          ingredients,
          allergens,
          is_available,
          created_at,
          updated_at
        FROM meals
        ORDER BY created_at DESC
      `

      meals = mealsQuery.map((meal) => ({
        ...meal,
        price: Number(meal.price) || 0,
        calories: Number(meal.calories) || 0,
        protein: Number(meal.protein) || 0,
        carbs: Number(meal.carbs) || 0,
        fat: Number(meal.fat) || 0,
        fiber: Number(meal.fiber) || 0,
        is_available: Boolean(meal.is_available),
        status: meal.is_available ? "active" : "inactive",
      }))

      console.log(`Found ${meals.length} meals`)
    } catch (error) {
      console.log("Meals query failed:", error)
      meals = []
    }

    return NextResponse.json({
      success: true,
      meals,
      total: meals.length,
    })
  } catch (error) {
    console.error("Error fetching meals:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch meals",
        error: error instanceof Error ? error.message : "Unknown error",
        meals: [],
        total: 0,
      },
      { status: 500 },
    )
  }
}
