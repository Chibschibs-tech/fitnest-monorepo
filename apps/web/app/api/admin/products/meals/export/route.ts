import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSessionUser } from "@/lib/simple-auth"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const sessionId = cookieStore.get("session-id")?.value

    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getSessionUser(sessionId)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "csv" // csv or json

    // Fetch all meals
    const meals = await sql`
      SELECT 
        id,
        title as name,
        description,
        meal_type,
        category,
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

    if (format === "json") {
      return NextResponse.json({
        success: true,
        meals: meals.map((meal: any) => ({
          id: meal.id,
          name: meal.name,
          description: meal.description || "",
          meal_type: meal.meal_type || "",
          category: meal.category || "meal",
          calories: Number(meal.calories) || 0,
          protein: Number(meal.protein) || 0,
          carbs: Number(meal.carbs) || 0,
          fat: Number(meal.fat) || 0,
          allergens: meal.allergens || [],
          tags: meal.tags || [],
          image_url: meal.image_url || "",
          is_available: Boolean(meal.is_available),
          created_at: meal.created_at,
        })),
        exported_at: new Date().toISOString(),
      })
    }

    // CSV format
    const headers = [
      "ID",
      "Name",
      "Description",
      "Meal Type",
      "Category",
      "Calories",
      "Protein (g)",
      "Carbs (g)",
      "Fat (g)",
      "Allergens",
      "Tags",
      "Image URL",
      "Available",
      "Created At",
    ]
    const csvRows = [headers.join(",")]

    meals.forEach((meal: any) => {
      const row = [
        meal.id,
        `"${(meal.name || "").replace(/"/g, '""')}"`,
        `"${(meal.description || "").replace(/"/g, '""')}"`,
        meal.meal_type || "",
        meal.category || "meal",
        meal.calories || 0,
        meal.protein || 0,
        meal.carbs || 0,
        meal.fat || 0,
        `"${Array.isArray(meal.allergens) ? meal.allergens.join("; ") : ""}"`,
        `"${Array.isArray(meal.tags) ? meal.tags.join("; ") : ""}"`,
        meal.image_url || "",
        meal.is_available ? "Yes" : "No",
        `"${new Date(meal.created_at).toLocaleString()}"`,
      ]
      csvRows.push(row.join(","))
    })

    const csvContent = csvRows.join("\n")

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="meals-export.csv"',
      },
    })
  } catch (error) {
    console.error("Error exporting meals:", error)
    return NextResponse.json({ error: "Failed to export meals" }, { status: 500 })
  }
}




