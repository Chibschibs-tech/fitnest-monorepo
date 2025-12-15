export const dynamic = "force-dynamic"
export const revalidate = 0

import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSessionUser } from "@/lib/simple-auth"

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

// POST: Run migration to create mp_categories table and migrate data
export async function POST(request: NextRequest) {
  try {
    const authCheck = await checkAdminAuth(request)
    if (authCheck.error) return authCheck.error

    // Step 1: Create mp_categories table
    await sql`
      CREATE TABLE IF NOT EXISTS mp_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        slug VARCHAR(200) UNIQUE NOT NULL,
        description TEXT,
        variables JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `

    // Step 2: Create default categories from existing audience values
    const defaultCategories = [
      { name: "Keto", slug: "keto", description: "Ketogenic diet plan (low-carb, high-fat)" },
      { name: "Low Carb", slug: "lowcarb", description: "Low carbohydrate diet plan" },
      { name: "Balanced", slug: "balanced", description: "Balanced nutrition plan" },
      { name: "Muscle Gain", slug: "muscle", description: "High protein plan for muscle building" },
      { name: "Custom", slug: "custom", description: "Customized meal plan" },
    ]

    const categoryMap: Record<string, number> = {}

    for (const cat of defaultCategories) {
      // Check if category already exists
      const existing = await sql`SELECT id FROM mp_categories WHERE slug = ${cat.slug}`
      
      if (existing.length === 0) {
        const result = await sql`
          INSERT INTO mp_categories (name, slug, description, variables)
          VALUES (${cat.name}, ${cat.slug}, ${cat.description}, '{}'::jsonb)
          RETURNING id
        `
        categoryMap[cat.slug] = result[0].id
      } else {
        categoryMap[cat.slug] = existing[0].id
      }
    }

    // Step 3: Add mp_category_id column to meal_plans if it doesn't exist
    try {
      await sql`ALTER TABLE meal_plans ADD COLUMN mp_category_id INTEGER REFERENCES mp_categories(id)`
    } catch (e: any) {
      // Column might already exist, ignore error
      if (!e.message?.includes("already exists")) {
        throw e
      }
    }

    // Step 4: Migrate existing audience values to mp_category_id
    const mealPlans = await sql`SELECT id, audience FROM meal_plans WHERE mp_category_id IS NULL`
    
    for (const plan of mealPlans) {
      const audience = plan.audience as string
      const categoryId = categoryMap[audience] || categoryMap["balanced"] // Default to balanced if not found
      
      if (categoryId) {
        await sql`
          UPDATE meal_plans
          SET mp_category_id = ${categoryId}
          WHERE id = ${plan.id}
        `
      }
    }

    // Step 5: Make mp_category_id NOT NULL (after migration)
    try {
      await sql`ALTER TABLE meal_plans ALTER COLUMN mp_category_id SET NOT NULL`
    } catch (e: any) {
      // Might fail if there are still NULL values, that's okay for now
      console.warn("Could not set mp_category_id as NOT NULL:", e.message)
    }

    // Step 6: Ensure all meal plans have audience set (for backward compatibility)
    // Update any meal plans that have mp_category_id but missing audience
    await sql`
      UPDATE meal_plans mp
      SET audience = mpc.slug
      FROM mp_categories mpc
      WHERE mp.mp_category_id = mpc.id
        AND (mp.audience IS NULL OR mp.audience = '')
    `

    // Step 6: Drop audience column (optional - we'll keep it for now as backup)
    // await sql`ALTER TABLE meal_plans DROP COLUMN audience`

    return NextResponse.json({
      success: true,
      message: "Migration completed successfully",
      categoriesCreated: Object.keys(categoryMap).length,
      mealPlansMigrated: mealPlans.length,
    })
  } catch (error) {
    console.error("Migration error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Migration failed",
      },
      { status: 500 }
    )
  }
}

