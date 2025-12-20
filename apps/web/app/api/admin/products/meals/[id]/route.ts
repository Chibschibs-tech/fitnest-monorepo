import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSessionUser } from "@/lib/simple-auth"
import { createErrorResponse, Errors } from "@/lib/error-handler"

export const dynamic = "force-dynamic"
export const revalidate = 0

// Helper to check admin auth
async function checkAdminAuth(request: NextRequest) {
  const sessionId = request.cookies.get("session-id")?.value
  if (!sessionId) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), user: null }
  }

  const user = await getSessionUser(sessionId)
  if (!user || user.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), user: null }
  }

  return { error: null, user }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authCheck = await checkAdminAuth(request)
    if (authCheck.error) return authCheck.error

    const mealId = Number.parseInt(params.id)
    if (isNaN(mealId)) {
      return createErrorResponse(Errors.validation("Invalid meal ID"), "Invalid meal ID", 400)
    }

    const data = await request.json()

    // Check if meal exists
    const existing = await sql`SELECT id FROM meals WHERE id = ${mealId}`
    if (existing.length === 0) {
      return createErrorResponse(Errors.notFound("Meal not found"), "Meal not found", 404)
    }

    // Build update query dynamically
    const updateFields: string[] = []
    const values: any[] = []
    let paramCounter = 1

    if (data.name !== undefined || data.title !== undefined) {
      const title = data.name || data.title
      updateFields.push(`title = $${paramCounter++}`)
      values.push(title)
      // Update slug if title changes
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      updateFields.push(`slug = $${paramCounter++}`)
      values.push(slug)
    }
    if (data.description !== undefined) {
      updateFields.push(`description = $${paramCounter++}`)
      values.push(data.description)
    }
    if (data.meal_type !== undefined) {
      updateFields.push(`meal_type = $${paramCounter++}`)
      values.push(data.meal_type || null)
    }
    if (data.category !== undefined) {
      updateFields.push(`category = $${paramCounter++}`)
      values.push(data.category || 'meal')
    }
    if (data.image_url !== undefined) {
      updateFields.push(`image_url = $${paramCounter++}`)
      values.push(data.image_url)
    }
    if (data.calories !== undefined || data.kcal !== undefined) {
      updateFields.push(`kcal = $${paramCounter++}`)
      values.push(data.calories || data.kcal || 0)
    }
    if (data.protein !== undefined) {
      updateFields.push(`protein = $${paramCounter++}`)
      values.push(Number(data.protein))
    }
    if (data.carbs !== undefined) {
      updateFields.push(`carbs = $${paramCounter++}`)
      values.push(Number(data.carbs))
    }
    if (data.fat !== undefined) {
      updateFields.push(`fat = $${paramCounter++}`)
      values.push(Number(data.fat))
    }
    if (data.fiber !== undefined) {
      updateFields.push(`fiber = $${paramCounter++}`)
      values.push(Number(data.fiber))
    }
    if (data.sodium !== undefined) {
      updateFields.push(`sodium = $${paramCounter++}`)
      values.push(Number(data.sodium))
    }
    if (data.sugar !== undefined) {
      updateFields.push(`sugar = $${paramCounter++}`)
      values.push(Number(data.sugar))
    }
    if (data.cholesterol !== undefined) {
      updateFields.push(`cholesterol = $${paramCounter++}`)
      values.push(Number(data.cholesterol))
    }
    if (data.saturated_fat !== undefined) {
      updateFields.push(`saturated_fat = $${paramCounter++}`)
      values.push(Number(data.saturated_fat))
    }
    if (data.is_available !== undefined || data.published !== undefined) {
      const published = data.published !== undefined ? data.published : data.is_available
      updateFields.push(`published = $${paramCounter++}`)
      values.push(published)
    }

    if (updateFields.length === 0) {
      return createErrorResponse(Errors.validation("No fields to update"), "No fields to update", 400)
    }

    values.push(mealId)

    // Use q() helper for parameterized queries
    const { q } = await import("@/lib/db")
    const result = await q(
      `UPDATE meals SET ${updateFields.join(', ')} WHERE id = $${paramCounter} RETURNING id, slug, title, description, meal_type, category, kcal, protein, carbs, fat, fiber, sodium, sugar, cholesterol, saturated_fat, allergens, tags, image_url, published, created_at`,
      values
    )

    const meal = result[0]

    return NextResponse.json({
      success: true,
      meal: {
        id: meal.id,
        name: meal.title,
        description: meal.description || '',
        price: 0, // Price managed separately
        category: meal.category || 'meal',
        meal_type: meal.meal_type || null,
        calories: Number(meal.kcal) || 0,
        protein: Number(meal.protein) || 0,
        carbs: Number(meal.carbs) || 0,
        fat: Number(meal.fat) || 0,
        fiber: Number(meal.fiber) || 0,
        sodium: Number(meal.sodium) || 0,
        sugar: Number(meal.sugar) || 0,
        cholesterol: Number(meal.cholesterol) || 0,
        saturated_fat: Number(meal.saturated_fat) || 0,
        image_url: meal.image_url,
        is_available: meal.published,
        status: meal.published ? 'active' : 'inactive',
        created_at: meal.created_at,
      },
    })
  } catch (error) {
    return createErrorResponse(error, "Failed to update meal", 500)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authCheck = await checkAdminAuth(request)
    if (authCheck.error) return authCheck.error

    const mealId = Number.parseInt(params.id)
    if (isNaN(mealId)) {
      return createErrorResponse(Errors.validation("Invalid meal ID"), "Invalid meal ID", 400)
    }

    // Check if meal exists
    const existing = await sql`SELECT id FROM meals WHERE id = ${mealId}`
    if (existing.length === 0) {
      return createErrorResponse(Errors.notFound("Meal not found"), "Meal not found", 404)
    }

    // Check if meal is used in any meal plans
    const usedInPlans = await sql`
      SELECT COUNT(*) as count
      FROM meal_plan_meals
      WHERE meal_id = ${mealId}
    `

    if (Number(usedInPlans[0]?.count || 0) > 0) {
      // Soft delete: just unpublish instead of deleting
      await sql`
        UPDATE meals 
        SET published = false
        WHERE id = ${mealId}
      `
      return NextResponse.json({
        success: true,
        message: "Meal unpublished (used in meal plans)",
      })
    }

    // Hard delete if not used
    await sql`DELETE FROM meals WHERE id = ${mealId}`

    return NextResponse.json({
      success: true,
      message: "Meal deleted successfully",
    })
  } catch (error) {
    return createErrorResponse(error, "Failed to delete meal", 500)
  }
}

