import { NextResponse } from "next/server"
import { type NextRequest } from "next/server"
import { cookies } from "next/headers"
import { getSessionUser } from "@/lib/simple-auth"
import { sql } from "@/lib/db"
import { createErrorResponse } from "@/lib/error-handler"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request?: NextRequest) {
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
      // Get meals from the meals table using correct schema
      const mealsQuery = await sql`
        SELECT 
          id,
          slug,
          title as name,
          description,
          kcal as calories,
          protein,
          carbs,
          fat,
          allergens,
          tags,
          image_url,
          published as is_available,
          created_at
        FROM meals
        ORDER BY created_at DESC
      `

      meals = mealsQuery.map((meal) => ({
        id: meal.id,
        name: meal.name,
        description: meal.description || '',
        price: 0, // Price managed through meal_type_prices
        category: 'meal', // Default category
        calories: Number(meal.calories) || 0,
        protein: Number(meal.protein) || 0,
        carbs: Number(meal.carbs) || 0,
        fat: Number(meal.fat) || 0,
        fiber: 0, // Not in schema
        ingredients: null, // Not in schema
        allergens: meal.allergens || [],
        tags: meal.tags || [],
        image_url: meal.image_url,
        is_available: Boolean(meal.is_available),
        status: meal.is_available ? "active" : "inactive",
        created_at: meal.created_at,
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

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { name, description, calories, protein, carbs, fat, image_url, category } = body

    // Validate required fields
    if (!name) {
      return createErrorResponse(
        new Error("Missing required fields"),
        "Missing required fields: name is required",
        400
      )
    }

    // Generate slug from title
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Insert new meal
    const result = await sql`
      INSERT INTO meals (slug, title, description, kcal, protein, carbs, fat, image_url, published)
      VALUES (${slug}, ${name}, ${description || null}, ${calories || 0}, ${protein || 0}, ${carbs || 0}, ${fat || 0}, ${image_url || null}, true)
      RETURNING id, slug, title, description, kcal, protein, carbs, fat, image_url, published, created_at
    `

    const newMeal = result[0]

    return NextResponse.json({
      success: true,
      meal: {
        id: newMeal.id,
        name: newMeal.title,
        description: newMeal.description || '',
        price: 0, // Price managed separately
        category: category || 'meal',
        calories: Number(newMeal.kcal) || 0,
        protein: Number(newMeal.protein) || 0,
        carbs: Number(newMeal.carbs) || 0,
        fat: Number(newMeal.fat) || 0,
        image_url: newMeal.image_url,
        is_available: newMeal.published,
        status: 'active',
        created_at: newMeal.created_at,
      },
    }, { status: 201 })
  } catch (error) {
    return createErrorResponse(error, "Failed to create meal", 500)
  }
}
