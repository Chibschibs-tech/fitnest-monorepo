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

// GET: List all MP Categories
export async function GET(request: NextRequest) {
  try {
    const authCheck = await checkAdminAuth(request)
    if (authCheck.error) return authCheck.error

    const categories = await sql`
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
      ORDER BY name ASC
    `

    return NextResponse.json({
      success: true,
      categories: categories.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description || '',
        variables: cat.variables || {},
        meal_plans_count: Number(cat.meal_plans_count || 0),
        created_at: cat.created_at,
        updated_at: cat.updated_at,
      })),
      total: categories.length,
    })
  } catch (error) {
    return createErrorResponse(error, "Failed to fetch MP categories", 500)
  }
}

// POST: Create a new MP Category
export async function POST(request: NextRequest) {
  try {
    const authCheck = await checkAdminAuth(request)
    if (authCheck.error) return authCheck.error

    const body = await request.json()
    const { name, description, variables = {}, basePrices } = body as {
      name?: string
      description?: string
      variables?: any
      // Optional: base prices per meal type, e.g. { Breakfast: 50, Lunch: 60, Dinner: 55, Snack: 15 }
      basePrices?: Record<string, number>
    }

    // Validate required fields
    if (!name) {
      return createErrorResponse(
        Errors.validation("Name is required"),
        "Name is required",
        400
      )
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check if slug already exists
    const existing = await sql`SELECT id FROM mp_categories WHERE slug = ${slug}`
    if (existing.length > 0) {
      return createErrorResponse(
        Errors.validation("A category with this name already exists"),
        "A category with this name already exists",
        400
      )
    }

    // Insert new category
    const result = await sql`
      INSERT INTO mp_categories (name, slug, description, variables)
      VALUES (${name}, ${slug}, ${description || null}, ${JSON.stringify(variables)}::jsonb)
      RETURNING id, name, slug, description, variables, created_at, updated_at
    `

    const newCategory = result[0]

    // Optionally create/update base meal prices for this category
    if (basePrices && typeof basePrices === "object") {
      const entries = Object.entries(basePrices).filter(
        ([, value]) => value !== undefined && value !== null && !Number.isNaN(Number(value)),
      )

      for (const [mealType, rawPrice] of entries) {
        const price = Number(rawPrice)
        if (!price || price <= 0) continue

        // Upsert into meal_type_prices so we can call the pricing engine by category/plan name
        await sql`
          INSERT INTO meal_type_prices (plan_name, meal_type, base_price_mad, is_active, created_at, updated_at)
          VALUES (${name}, ${mealType}, ${price}, true, NOW(), NOW())
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
        id: newCategory.id,
        name: newCategory.name,
        slug: newCategory.slug,
        description: newCategory.description || '',
        variables: newCategory.variables || {},
        created_at: newCategory.created_at,
        updated_at: newCategory.updated_at,
      },
    }, { status: 201 })
  } catch (error) {
    return createErrorResponse(error, "Failed to create MP category", 500)
  }
}

