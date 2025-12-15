export const dynamic = "force-dynamic"
export const revalidate = 0

import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSessionUser } from "@/lib/simple-auth"
import { createErrorResponse, Errors } from "@/lib/error-handler"

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

// GET: Get a single MP Category
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authCheck = await checkAdminAuth(request)
    if (authCheck.error) return authCheck.error

    const categoryId = Number.parseInt(params.id)
    if (isNaN(categoryId)) {
      return createErrorResponse(Errors.validation("Invalid category ID"), "Invalid category ID", 400)
    }

    const result = await sql`
      SELECT 
        id,
        name,
        slug,
        description,
        variables,
        created_at,
        updated_at,
        (SELECT COUNT(*) FROM meal_plans WHERE mp_category_id = mp_categories.id) as meal_plans_count
      FROM mp_categories
      WHERE id = ${categoryId}
    `

    if (result.length === 0) {
      return createErrorResponse(Errors.notFound("MP Category not found"), "MP Category not found", 404)
    }

    const category = result[0]

    return NextResponse.json({
      success: true,
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        variables: category.variables || {},
        meal_plans_count: Number(category.meal_plans_count || 0),
        created_at: category.created_at,
        updated_at: category.updated_at,
      },
    })
  } catch (error) {
    return createErrorResponse(error, "Failed to fetch MP category", 500)
  }
}

// PUT: Update an MP Category
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authCheck = await checkAdminAuth(request)
    if (authCheck.error) return authCheck.error

    const categoryId = Number.parseInt(params.id)
    if (isNaN(categoryId)) {
      return createErrorResponse(Errors.validation("Invalid category ID"), "Invalid category ID", 400)
    }

    const body = await request.json()
    const { name, description, variables, basePrices } = body as {
      name?: string
      description?: string
      variables?: any
      basePrices?: Record<string, number>
    }

    // Check if category exists
    const existing = await sql`SELECT id, slug FROM mp_categories WHERE id = ${categoryId}`
    if (existing.length === 0) {
      return createErrorResponse(Errors.notFound("MP Category not found"), "MP Category not found", 404)
    }

    // Build update query dynamically
    const updateFields: string[] = []
    const values: any[] = []
    let paramCounter = 1

    if (name !== undefined) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      
      // Check if new slug conflicts with another category
      const slugConflict = await sql`SELECT id FROM mp_categories WHERE slug = ${slug} AND id != ${categoryId}`
      if (slugConflict.length > 0) {
        return createErrorResponse(
          Errors.validation("A category with this name already exists"),
          "A category with this name already exists",
          400
        )
      }

      updateFields.push(`name = $${paramCounter++}`)
      values.push(name)
      updateFields.push(`slug = $${paramCounter++}`)
      values.push(slug)
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramCounter++}`)
      values.push(description)
    }
    if (variables !== undefined) {
      updateFields.push(`variables = $${paramCounter++}::jsonb`)
      values.push(JSON.stringify(variables))
    }

    if (updateFields.length === 0) {
      return createErrorResponse(Errors.validation("No fields to update"), "No fields to update", 400)
    }

    // Add updated_at
    updateFields.push(`updated_at = NOW()`)
    values.push(categoryId)

    // Use q() helper for parameterized queries
    const { q } = await import("@/lib/db")
    const result = await q(
      `UPDATE mp_categories SET ${updateFields.join(', ')} WHERE id = $${paramCounter} RETURNING id, name, slug, description, variables, created_at, updated_at`,
      values
    )

    // Optionally upsert base meal prices for this category
    if (basePrices && typeof basePrices === "object") {
      const categoryName = (name as string) || existing[0].name
      const entries = Object.entries(basePrices).filter(
        ([, value]) => value !== undefined && value !== null && !Number.isNaN(Number(value)),
      )

      for (const [mealType, rawPrice] of entries) {
        const price = Number(rawPrice)
        if (!price || price <= 0) continue

        await sql`
          INSERT INTO meal_type_prices (plan_name, meal_type, base_price_mad, is_active, created_at, updated_at)
          VALUES (${categoryName}, ${mealType}, ${price}, true, NOW(), NOW())
          ON CONFLICT (plan_name, meal_type)
          DO UPDATE SET 
            base_price_mad = EXCLUDED.base_price_mad,
            is_active = true,
            updated_at = NOW()
        `
      }
    }

    return NextResponse.json({
      success: true,
      category: {
        id: result[0].id,
        name: result[0].name,
        slug: result[0].slug,
        description: result[0].description || '',
        variables: result[0].variables || {},
        created_at: result[0].created_at,
        updated_at: result[0].updated_at,
      },
    })
  } catch (error) {
    return createErrorResponse(error, "Failed to update MP category", 500)
  }
}

// DELETE: Delete an MP Category
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authCheck = await checkAdminAuth(request)
    if (authCheck.error) return authCheck.error

    const categoryId = Number.parseInt(params.id)
    if (isNaN(categoryId)) {
      return createErrorResponse(Errors.validation("Invalid category ID"), "Invalid category ID", 400)
    }

    // Check if category exists
    const existing = await sql`SELECT id FROM mp_categories WHERE id = ${categoryId}`
    if (existing.length === 0) {
      return createErrorResponse(Errors.notFound("MP Category not found"), "MP Category not found", 404)
    }

    // Check if there are meal plans using this category
    const mealPlansCount = await sql`
      SELECT COUNT(*) as count
      FROM meal_plans
      WHERE mp_category_id = ${categoryId}
    `

    if (Number(mealPlansCount[0]?.count || 0) > 0) {
      return createErrorResponse(
        Errors.validation("Cannot delete category with associated meal plans"),
        "Cannot delete category. There are meal plans associated with this category.",
        400
      )
    }

    // Delete category
    await sql`DELETE FROM mp_categories WHERE id = ${categoryId}`

    return NextResponse.json({
      success: true,
      message: "MP Category deleted successfully",
    })
  } catch (error) {
    return createErrorResponse(error, "Failed to delete MP category", 500)
  }
}

