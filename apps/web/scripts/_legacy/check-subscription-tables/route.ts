import { type NextRequest, NextResponse } from "next/server"
import { sql, db } from "@/lib/db"
import { getSessionUser } from "@/lib/simple-auth"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("session-id")?.value
    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getSessionUser(sessionId)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Check which tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('products', 'subscription_plans', 'subscription_plan_items', 'active_subscriptions', 'deliveries')
      ORDER BY table_name
    `

    const existingTables = tables.map((t) => t.table_name)

    // Check products table structure
    let productsStructure = []
    let sampleProducts = []
    if (existingTables.includes("products")) {
      productsStructure = await sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products'
        ORDER BY ordinal_position
      `

      // Get sample products with dynamic price column detection
      const priceColumns = ["base_price", "price", "weekly_price"]
      let priceColumn = null

      for (const col of priceColumns) {
        const columnExists = productsStructure.some((c) => c.column_name === col)
        if (columnExists) {
          priceColumn = col
          break
        }
      }

      if (priceColumn) {
        sampleProducts = await sql`
          SELECT id, name, ${q(priceColumn)} as price, product_type
          FROM products 
          LIMIT 10
        `
      } else {
        sampleProducts = await sql`
          SELECT id, name, 'No price column' as price, product_type
          FROM products 
          LIMIT 10
        `
      }
    }

    // Check subscription tables structure if they exist
    const subscriptionTablesInfo = {}
    const subscriptionTables = ["subscription_plans", "subscription_plan_items", "active_subscriptions", "deliveries"]

    for (const tableName of subscriptionTables) {
      if (existingTables.includes(tableName)) {
        try {
          const structure = await sql`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = ${tableName}
            ORDER BY ordinal_position
          `

          const count = await sql`SELECT COUNT(*) as count FROM ${q(tableName)}`

          subscriptionTablesInfo[tableName] = {
            structure,
            count: Number.parseInt(count[0].count),
          }
        } catch (error) {
          subscriptionTablesInfo[tableName] = {
            structure: [],
            count: 0,
            error: error instanceof Error ? error.message : "Unknown error",
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      existingTables,
      missingTables: [
        "products",
        "subscription_plans",
        "subscription_plan_items",
        "active_subscriptions",
        "deliveries",
      ].filter((t) => !existingTables.includes(t)),
      productsStructure,
      sampleProducts,
      subscriptionTablesInfo,
    })
  } catch (error) {
    console.error("Check subscription tables error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
