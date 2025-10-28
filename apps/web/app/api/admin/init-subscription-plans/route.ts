export const dynamic = "force-dynamic";
export const revalidate = 0;

import { type NextRequest, NextResponse } from "next/server"
import { sql, db } from "@/lib/db"
import { getSessionUser } from "@/lib/simple-auth"


export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("session-id")?.value
    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getSessionUser(sessionId)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    console.log("Initializing subscription plans...")

    // First check if tables exist
    const tablesCheck = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('subscription_plans', 'subscription_plan_items', 'products')
    `

    const tableNames = tablesCheck.map((row) => row.table_name)
    if (!tableNames.includes("subscription_plans") || !tableNames.includes("subscription_plan_items")) {
      return NextResponse.json(
        {
          success: false,
          error: "Subscription tables don't exist. Please create them first.",
          missingTables: ["subscription_plans", "subscription_plan_items"].filter((t) => !tableNames.includes(t)),
        },
        { status: 400 },
      )
    }

    if (!tableNames.includes("products")) {
      return NextResponse.json(
        {
          success: false,
          error: "Products table doesn't exist. Please ensure your database is properly initialized.",
        },
        { status: 400 },
      )
    }

    // Check what columns exist in products table
    const productsColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'products'
    `

    const columnNames = productsColumns.map((col) => col.column_name)
    console.log("Available product columns:", columnNames)

    // Find a suitable price column
    let priceColumn = null
    const possiblePriceColumns = ["price", "base_price", "weekly_price", "sale_price"]

    for (const col of possiblePriceColumns) {
      if (columnNames.includes(col)) {
        priceColumn = col
        break
      }
    }

    if (!priceColumn) {
      return NextResponse.json(
        {
          success: false,
          error: "No price column found in products table.",
          details: {
            availableColumns: columnNames,
            expectedColumns: possiblePriceColumns,
          },
        },
        { status: 400 },
      )
    }

    console.log("Using price column:", priceColumn)

    // Create default meal plan products
    const defaultPlans = [
      { name: "Stay Fit Plan", price: 299, description: "Balanced meals for maintaining fitness and health" },
      {
        name: "Weight Loss Plan",
        price: 299,
        description: "Calorie-controlled meals designed for healthy weight management",
      },
      {
        name: "Muscle Gain Plan",
        price: 399,
        description: "High-protein meals optimized for muscle building and recovery",
      },
      { name: "Keto Plan", price: 349, description: "Low-carb, high-fat ketogenic meals for metabolic health" },
    ]

    console.log("Creating meal plan products...")
    const mealPlanProducts = []

    for (const plan of defaultPlans) {
      const slug = plan.name.toLowerCase().replace(/\s+/g, "-")
      try {
        console.log(`Creating product: ${plan.name}`)

        // Check if slug column exists
        const hasSlug = columnNames.includes("slug")

        let insertResult
        if (hasSlug) {
          insertResult = await sql`
            INSERT INTO products (name, slug, description, ${sql.unsafe(priceColumn)}, category, stock, isactive)
            VALUES (${plan.name}, ${slug}, ${plan.description}, ${plan.price}, 'meal-plans', 999, true)
            ON CONFLICT (slug) DO UPDATE SET
              name = EXCLUDED.name,
              description = EXCLUDED.description,
              ${sql.unsafe(priceColumn)} = EXCLUDED.${sql.unsafe(priceColumn)}
            RETURNING id, name, ${sql.unsafe(priceColumn)} as price
          `
        } else {
          insertResult = await sql`
            INSERT INTO products (name, description, ${sql.unsafe(priceColumn)}, category, stock, isactive)
            VALUES (${plan.name}, ${plan.description}, ${plan.price}, 'meal-plans', 999, true)
            RETURNING id, name, ${sql.unsafe(priceColumn)} as price
          `
        }

        if (insertResult.length > 0) {
          mealPlanProducts.push(insertResult[0])
          console.log(`Successfully created product: ${plan.name} (ID: ${insertResult[0].id})`)
        }
      } catch (error) {
        console.error(`Error creating product ${plan.name}:`, error)
        // Try without optional columns
        try {
          const basicResult = await sql`
            INSERT INTO products (name, description, ${sql.unsafe(priceColumn)})
            VALUES (${plan.name}, ${plan.description}, ${plan.price})
            RETURNING id, name, ${sql.unsafe(priceColumn)} as price
          `
          if (basicResult.length > 0) {
            mealPlanProducts.push(basicResult[0])
            console.log(`Created basic product: ${plan.name} (ID: ${basicResult[0].id})`)
          }
        } catch (basicError) {
          console.error(`Failed to create basic product ${plan.name}:`, basicError)
        }
      }
    }

    console.log("Total meal plan products created:", mealPlanProducts.length)

    // Get some sample meals for plan items
    const sampleMeals = await sql`
      SELECT id, name, ${sql.unsafe(priceColumn)} as price 
      FROM products 
      WHERE name NOT ILIKE '%plan%'
      AND ${sql.unsafe(priceColumn)} IS NOT NULL
      AND ${sql.unsafe(priceColumn)} > 0
      LIMIT 20
    `

    console.log("Found sample meals:", sampleMeals.length)

    let createdPlans = 0
    let createdItems = 0

    // Create subscription plans for each meal plan product
    for (const product of mealPlanProducts) {
      console.log(`Processing product: ${product.name} (ID: ${product.id})`)

      // Check if plan already exists
      const existingPlan = await sql`
        SELECT id FROM subscription_plans WHERE product_id = ${product.id}
      `

      if (existingPlan.length > 0) {
        console.log(`Plan for product ${product.name} already exists, skipping...`)
        continue
      }

      // Determine plan details based on product name
      const billingPeriod = "weekly"
      const deliveryFrequency = "weekly"
      let itemsPerDelivery = 3
      let price = Number(product.price) || 299

      if (product.name.toLowerCase().includes("muscle")) {
        price = 399
        itemsPerDelivery = 4
      } else if (product.name.toLowerCase().includes("keto")) {
        price = 349
      }

      try {
        // Create subscription plan
        const planResult = await sql`
          INSERT INTO subscription_plans (
            product_id, name, description, billing_period, price, 
            delivery_frequency, items_per_delivery, is_active
          ) VALUES (
            ${product.id}, 
            ${product.name}, 
            ${"Weekly meal plan with " + itemsPerDelivery + " meals per delivery"}, 
            ${billingPeriod}, 
            ${price}, 
            ${deliveryFrequency}, 
            ${itemsPerDelivery}, 
            true
          ) RETURNING id
        `

        const planId = planResult[0].id
        createdPlans++
        console.log(`Created subscription plan: ${product.name} (Plan ID: ${planId})`)

        // Add sample meals to the plan if we have any
        if (sampleMeals.length > 0) {
          const mealsToAdd = sampleMeals.slice(0, Math.min(8, sampleMeals.length))

          for (let i = 0; i < mealsToAdd.length; i++) {
            const meal = mealsToAdd[i]

            try {
              await sql`
                INSERT INTO subscription_plan_items (
                  plan_id, product_id, quantity, is_optional, sort_order
                ) VALUES (
                  ${planId}, 
                  ${meal.id}, 
                  1, 
                  ${i >= itemsPerDelivery}, 
                  ${i}
                )
              `
              createdItems++
            } catch (itemError) {
              console.error(`Error creating plan item for meal ${meal.name}:`, itemError)
            }
          }
          console.log(`Added ${mealsToAdd.length} items to plan ${product.name}`)
        }
      } catch (planError) {
        console.error(`Error creating plan for product ${product.name}:`, planError)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully created ${createdPlans} subscription plans with ${createdItems} plan items`,
      details: {
        plansCreated: createdPlans,
        itemsCreated: createdItems,
        mealPlanProducts: mealPlanProducts.length,
        sampleMeals: sampleMeals.length,
        priceColumnUsed: priceColumn,
        availableColumns: columnNames || [],
        createdProducts: mealPlanProducts.map((p) => ({ id: p.id, name: p.name, price: p.price })),
      },
    })
  } catch (error) {
    console.error("Init subscription plans error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: {
          stack: error instanceof Error ? error.stack : undefined,
          message: error instanceof Error ? error.message : "Unknown error occurred",
        },
      },
      { status: 500 },
    )
  }
}
