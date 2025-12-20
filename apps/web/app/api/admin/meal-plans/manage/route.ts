import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSessionUser } from "@/lib/simple-auth"

export const dynamic = "force-dynamic"

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

// POST endpoint to manage meal plans (delete and create)
export async function POST(request: NextRequest) {
  try {
    const authCheck = await checkAdminAuth(request)
    if (authCheck.error) return authCheck.error

    const body = await request.json()
    const { action } = body

    if (action === "delete_keto_classic") {
      // Find and delete "Keto classic" meal plan
      const ketoPlans = await sql`
        SELECT id, title, slug FROM meal_plans 
        WHERE LOWER(title) LIKE '%keto%classic%' OR LOWER(title) = 'keto classic'
      `

      if (ketoPlans.length === 0) {
        return NextResponse.json({
          success: true,
          message: "No 'Keto classic' meal plan found to delete",
          deleted: [],
        })
      }

      const deletedIds = []
      for (const plan of ketoPlans) {
        // Delete related plan_variants first (cascade should handle this, but being explicit)
        await sql`DELETE FROM plan_variants WHERE meal_plan_id = ${plan.id}`
        // Delete the meal plan
        await sql`DELETE FROM meal_plans WHERE id = ${plan.id}`
        deletedIds.push(plan.id)
      }

      return NextResponse.json({
        success: true,
        message: `Deleted ${deletedIds.length} meal plan(s)`,
        deleted: deletedIds,
      })
    }

    if (action === "create_new_plans") {
      // Get or create mp_categories
      const categories = await sql`
        SELECT id, slug, name FROM mp_categories
      `

      // Find or create categories
      let lowcarbCategoryId = categories.find((c: any) => c.slug === "lowcarb" || c.slug === "low-carb")?.id
      let balancedCategoryId = categories.find((c: any) => c.slug === "balanced")?.id
      let muscleCategoryId = categories.find((c: any) => c.slug === "muscle" || c.slug === "high-protein")?.id

      // Create categories if they don't exist
      if (!lowcarbCategoryId) {
        const result = await sql`
          INSERT INTO mp_categories (name, slug, description)
          VALUES ('Low Carb', 'lowcarb', 'Low carbohydrate meal plans')
          ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
          RETURNING id
        `
        lowcarbCategoryId = result[0]?.id
      }

      if (!balancedCategoryId) {
        const result = await sql`
          INSERT INTO mp_categories (name, slug, description)
          VALUES ('Balanced', 'balanced', 'Balanced nutrition meal plans')
          ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
          RETURNING id
        `
        balancedCategoryId = result[0]?.id
      }

      if (!muscleCategoryId) {
        const result = await sql`
          INSERT INTO mp_categories (name, slug, description)
          VALUES ('High Protein', 'muscle', 'High protein meal plans for muscle building')
          ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
          RETURNING id
        `
        muscleCategoryId = result[0]?.id
      }

      // Create the 3 new meal plans
      const newPlans = []

      // 1. Low carb
      const lowcarbSlug = "low-carb"
      const lowcarbResult = await sql`
        INSERT INTO meal_plans (slug, title, summary, mp_category_id, audience, published)
        VALUES (
          ${lowcarbSlug},
          'Low carb',
          'Un plan nutritionnel conçu pour minimiser les glucides tout en maintenant une nutrition optimale. Idéal pour la perte de poids, la gestion de la glycémie et un mode de vie faible en glucides. Nos repas sont riches en protéines, en graisses saines et en légumes, avec un apport contrôlé en glucides.',
          ${lowcarbCategoryId},
          'lowcarb',
          true
        )
        ON CONFLICT (slug) DO UPDATE 
        SET title = EXCLUDED.title, summary = EXCLUDED.summary, mp_category_id = EXCLUDED.mp_category_id
        RETURNING id, slug, title, summary
      `
      newPlans.push(lowcarbResult[0])

      // 2. Balanced
      const balancedSlug = "balanced"
      const balancedResult = await sql`
        INSERT INTO meal_plans (slug, title, summary, mp_category_id, audience, published)
        VALUES (
          ${balancedSlug},
          'Balanced',
          'Un plan nutritionnel équilibré qui combine parfaitement les macronutriments pour une santé optimale. Parfait pour maintenir un poids santé, améliorer l''énergie et soutenir un mode de vie actif. Nos repas offrent un équilibre idéal entre protéines, glucides complexes et graisses saines.',
          ${balancedCategoryId},
          'balanced',
          true
        )
        ON CONFLICT (slug) DO UPDATE 
        SET title = EXCLUDED.title, summary = EXCLUDED.summary, mp_category_id = EXCLUDED.mp_category_id
        RETURNING id, slug, title, summary
      `
      newPlans.push(balancedResult[0])

      // 3. Protein power
      const proteinSlug = "protein-power"
      const proteinResult = await sql`
        INSERT INTO meal_plans (slug, title, summary, mp_category_id, audience, published)
        VALUES (
          ${proteinSlug},
          'Protein power',
          'Un plan nutritionnel riche en protéines conçu pour la construction musculaire, la récupération après l''entraînement et la satiété. Idéal pour les athlètes, les personnes actives et ceux qui cherchent à augmenter leur masse musculaire. Nos repas contiennent des quantités élevées de protéines de haute qualité avec des glucides propres pour l''énergie.',
          ${muscleCategoryId},
          'muscle',
          true
        )
        ON CONFLICT (slug) DO UPDATE 
        SET title = EXCLUDED.title, summary = EXCLUDED.summary, mp_category_id = EXCLUDED.mp_category_id
        RETURNING id, slug, title, summary
      `
      newPlans.push(proteinResult[0])

      return NextResponse.json({
        success: true,
        message: "Created 3 new meal plans",
        plans: newPlans,
      })
    }

    if (action === "full_migration") {
      // Do both: delete keto classic and create new plans
      // First delete
      const ketoPlans = await sql`
        SELECT id, title, slug FROM meal_plans 
        WHERE LOWER(title) LIKE '%keto%classic%' OR LOWER(title) = 'keto classic'
      `

      const deletedIds = []
      for (const plan of ketoPlans) {
        await sql`DELETE FROM plan_variants WHERE meal_plan_id = ${plan.id}`
        await sql`DELETE FROM meal_plans WHERE id = ${plan.id}`
        deletedIds.push(plan.id)
      }

      // Then create new plans (same code as above)
      const categories = await sql`
        SELECT id, slug, name FROM mp_categories
      `

      let lowcarbCategoryId = categories.find((c: any) => c.slug === "lowcarb" || c.slug === "low-carb")?.id
      let balancedCategoryId = categories.find((c: any) => c.slug === "balanced")?.id
      let muscleCategoryId = categories.find((c: any) => c.slug === "muscle" || c.slug === "high-protein")?.id

      if (!lowcarbCategoryId) {
        const result = await sql`
          INSERT INTO mp_categories (name, slug, description)
          VALUES ('Low Carb', 'lowcarb', 'Low carbohydrate meal plans')
          ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
          RETURNING id
        `
        lowcarbCategoryId = result[0]?.id
      }

      if (!balancedCategoryId) {
        const result = await sql`
          INSERT INTO mp_categories (name, slug, description)
          VALUES ('Balanced', 'balanced', 'Balanced nutrition meal plans')
          ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
          RETURNING id
        `
        balancedCategoryId = result[0]?.id
      }

      if (!muscleCategoryId) {
        const result = await sql`
          INSERT INTO mp_categories (name, slug, description)
          VALUES ('High Protein', 'muscle', 'High protein meal plans for muscle building')
          ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
          RETURNING id
        `
        muscleCategoryId = result[0]?.id
      }

      const newPlans = []

      const lowcarbSlug = "low-carb"
      const lowcarbResult = await sql`
        INSERT INTO meal_plans (slug, title, summary, mp_category_id, audience, published)
        VALUES (
          ${lowcarbSlug},
          'Low carb',
          'Un plan nutritionnel conçu pour minimiser les glucides tout en maintenant une nutrition optimale. Idéal pour la perte de poids, la gestion de la glycémie et un mode de vie faible en glucides. Nos repas sont riches en protéines, en graisses saines et en légumes, avec un apport contrôlé en glucides.',
          ${lowcarbCategoryId},
          'lowcarb',
          true
        )
        ON CONFLICT (slug) DO UPDATE 
        SET title = EXCLUDED.title, summary = EXCLUDED.summary, mp_category_id = EXCLUDED.mp_category_id
        RETURNING id, slug, title, summary
      `
      newPlans.push(lowcarbResult[0])

      const balancedSlug = "balanced"
      const balancedResult = await sql`
        INSERT INTO meal_plans (slug, title, summary, mp_category_id, audience, published)
        VALUES (
          ${balancedSlug},
          'Balanced',
          'Un plan nutritionnel équilibré qui combine parfaitement les macronutriments pour une santé optimale. Parfait pour maintenir un poids santé, améliorer l''énergie et soutenir un mode de vie actif. Nos repas offrent un équilibre idéal entre protéines, glucides complexes et graisses saines.',
          ${balancedCategoryId},
          'balanced',
          true
        )
        ON CONFLICT (slug) DO UPDATE 
        SET title = EXCLUDED.title, summary = EXCLUDED.summary, mp_category_id = EXCLUDED.mp_category_id
        RETURNING id, slug, title, summary
      `
      newPlans.push(balancedResult[0])

      const proteinSlug = "protein-power"
      const proteinResult = await sql`
        INSERT INTO meal_plans (slug, title, summary, mp_category_id, audience, published)
        VALUES (
          ${proteinSlug},
          'Protein power',
          'Un plan nutritionnel riche en protéines conçu pour la construction musculaire, la récupération après l''entraînement et la satiété. Idéal pour les athlètes, les personnes actives et ceux qui cherchent à augmenter leur masse musculaire. Nos repas contiennent des quantités élevées de protéines de haute qualité avec des glucides propres pour l''énergie.',
          ${muscleCategoryId},
          'muscle',
          true
        )
        ON CONFLICT (slug) DO UPDATE 
        SET title = EXCLUDED.title, summary = EXCLUDED.summary, mp_category_id = EXCLUDED.mp_category_id
        RETURNING id, slug, title, summary
      `
      newPlans.push(proteinResult[0])

      return NextResponse.json({
        success: true,
        message: "Migration completed",
        deleted: deletedIds,
        created: newPlans,
      })
    }

    return NextResponse.json(
      { error: "Invalid action. Use 'delete_keto_classic', 'create_new_plans', or 'full_migration'" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Error managing meal plans:", error)
    return NextResponse.json(
      {
        error: "Failed to manage meal plans",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

