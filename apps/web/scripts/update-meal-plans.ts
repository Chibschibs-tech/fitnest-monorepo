/**
 * Script to:
 * 1. Delete "Keto classic" meal plan
 * 2. Create 3 new meal plans: "Low carb", "Balanced", "Protein power"
 * 
 * Run with: npx tsx scripts/update-meal-plans.ts
 */

import { sql } from "../lib/db"

async function main() {
  try {
    console.log("Starting meal plan migration...")

    // Step 1: Find and delete "Keto classic" meal plan
    console.log("\n1. Searching for 'Keto classic' meal plan...")
    const ketoPlans = await sql`
      SELECT id, title, slug FROM meal_plans 
      WHERE LOWER(title) LIKE '%keto%classic%' OR LOWER(title) = 'keto classic'
    `

    if (ketoPlans.length === 0) {
      console.log("   ✓ No 'Keto classic' meal plan found")
    } else {
      console.log(`   Found ${ketoPlans.length} meal plan(s) to delete:`)
      for (const plan of ketoPlans) {
        console.log(`   - ${plan.title} (ID: ${plan.id}, slug: ${plan.slug})`)
      }

      const deletedIds = []
      for (const plan of ketoPlans) {
        // Delete related plan_variants first
        await sql`DELETE FROM plan_variants WHERE meal_plan_id = ${plan.id}`
        // Delete the meal plan
        await sql`DELETE FROM meal_plans WHERE id = ${plan.id}`
        deletedIds.push(plan.id)
        console.log(`   ✓ Deleted meal plan: ${plan.title}`)
      }
      console.log(`   ✓ Successfully deleted ${deletedIds.length} meal plan(s)`)
    }

    // Step 2: Get or create mp_categories
    console.log("\n2. Setting up meal plan categories...")
    const categories = await sql`
      SELECT id, slug, name FROM mp_categories
    `

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
      console.log("   ✓ Created/updated 'Low Carb' category")
    } else {
      console.log("   ✓ 'Low Carb' category exists")
    }

    if (!balancedCategoryId) {
      const result = await sql`
        INSERT INTO mp_categories (name, slug, description)
        VALUES ('Balanced', 'balanced', 'Balanced nutrition meal plans')
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
      `
      balancedCategoryId = result[0]?.id
      console.log("   ✓ Created/updated 'Balanced' category")
    } else {
      console.log("   ✓ 'Balanced' category exists")
    }

    if (!muscleCategoryId) {
      const result = await sql`
        INSERT INTO mp_categories (name, slug, description)
        VALUES ('High Protein', 'muscle', 'High protein meal plans for muscle building')
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
      `
      muscleCategoryId = result[0]?.id
      console.log("   ✓ Created/updated 'High Protein' category")
    } else {
      console.log("   ✓ 'High Protein' category exists")
    }

    // Step 3: Create the 3 new meal plans
    console.log("\n3. Creating new meal plans...")

    // 1. Low carb
    const lowcarbSlug = "low-carb"
    const lowcarbDescription = "Un plan nutritionnel conçu pour minimiser les glucides tout en maintenant une nutrition optimale. Idéal pour la perte de poids, la gestion de la glycémie et un mode de vie faible en glucides. Nos repas sont riches en protéines, en graisses saines et en légumes, avec un apport contrôlé en glucides."
    
    const lowcarbResult = await sql`
      INSERT INTO meal_plans (slug, title, summary, mp_category_id, audience, published)
      VALUES (
        ${lowcarbSlug},
        'Low carb',
        ${lowcarbDescription},
        ${lowcarbCategoryId},
        'lowcarb',
        true
      )
      ON CONFLICT (slug) DO UPDATE 
      SET title = EXCLUDED.title, 
          summary = EXCLUDED.summary, 
          mp_category_id = EXCLUDED.mp_category_id,
          published = EXCLUDED.published
      RETURNING id, slug, title
    `
    if (lowcarbResult && lowcarbResult.length > 0) {
      console.log(`   ✓ Created/updated: ${lowcarbResult[0].title} (ID: ${lowcarbResult[0].id})`)
    } else {
      console.log(`   ✓ Created/updated: Low carb (no ID returned)`)
    }

    // 2. Balanced
    const balancedSlug = "balanced"
    const balancedDescription = "Un plan nutritionnel équilibré qui combine parfaitement les macronutriments pour une santé optimale. Parfait pour maintenir un poids santé, améliorer l'énergie et soutenir un mode de vie actif. Nos repas offrent un équilibre idéal entre protéines, glucides complexes et graisses saines."
    
    const balancedResult = await sql`
      INSERT INTO meal_plans (slug, title, summary, mp_category_id, audience, published)
      VALUES (
        ${balancedSlug},
        'Balanced',
        ${balancedDescription},
        ${balancedCategoryId},
        'balanced',
        true
      )
      ON CONFLICT (slug) DO UPDATE 
      SET title = EXCLUDED.title, 
          summary = EXCLUDED.summary, 
          mp_category_id = EXCLUDED.mp_category_id,
          published = EXCLUDED.published
      RETURNING id, slug, title
    `
    if (balancedResult && balancedResult.length > 0) {
      console.log(`   ✓ Created/updated: ${balancedResult[0].title} (ID: ${balancedResult[0].id})`)
    } else {
      console.log(`   ✓ Created/updated: Balanced (no ID returned)`)
    }

    // 3. Protein power
    const proteinSlug = "protein-power"
    const proteinDescription = "Un plan nutritionnel riche en protéines conçu pour la construction musculaire, la récupération après l'entraînement et la satiété. Idéal pour les athlètes, les personnes actives et ceux qui cherchent à augmenter leur masse musculaire. Nos repas contiennent des quantités élevées de protéines de haute qualité avec des glucides propres pour l'énergie."
    
    const proteinResult = await sql`
      INSERT INTO meal_plans (slug, title, summary, mp_category_id, audience, published)
      VALUES (
        ${proteinSlug},
        'Protein power',
        ${proteinDescription},
        ${muscleCategoryId},
        'muscle',
        true
      )
      ON CONFLICT (slug) DO UPDATE 
      SET title = EXCLUDED.title, 
          summary = EXCLUDED.summary, 
          mp_category_id = EXCLUDED.mp_category_id,
          published = EXCLUDED.published
      RETURNING id, slug, title
    `
    if (proteinResult && proteinResult.length > 0) {
      console.log(`   ✓ Created/updated: ${proteinResult[0].title} (ID: ${proteinResult[0].id})`)
    } else {
      console.log(`   ✓ Created/updated: Protein power (no ID returned)`)
    }

    console.log("\n✅ Migration completed successfully!")
    console.log("\nSummary:")
    console.log(`  - Deleted: ${ketoPlans.length} meal plan(s)`)
    console.log(`  - Created/Updated: 3 meal plans`)
    console.log("\nNew meal plans:")
    console.log(`  1. Low carb (${lowcarbSlug})`)
    console.log(`  2. Balanced (${balancedSlug})`)
    console.log(`  3. Protein power (${proteinSlug})`)

  } catch (error) {
    console.error("❌ Error during migration:", error)
    process.exit(1)
  }
}

main()

