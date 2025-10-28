export const dynamic = "force-dynamic";
export const revalidate = 0;

import { type NextRequest, NextResponse } from "next/server"
import { sql, db } from "@/lib/db"
import { getSessionUser } from "@/lib/simple-auth"


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

    // Get all products
    const allProducts = await sql`
      SELECT id, name, description, price, category, tags, stock, isactive
      FROM products 
      ORDER BY name
      LIMIT 50
    `

    // Get products table structure
    const tableStructure = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'products'
      ORDER BY ordinal_position
    `

    // Try to create a test product
    let testProductResult = null
    try {
      const testResult = await sql`
        INSERT INTO products (name, slug, description, price, category, stock, isactive)
        VALUES ('Test Meal Plan', 'test-meal-plan', 'Test description', 299, 'meal-plans', 999, true)
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          price = EXCLUDED.price
        RETURNING id, name, price
      `
      testProductResult = testResult[0]
    } catch (error) {
      testProductResult = { error: error instanceof Error ? error.message : "Unknown error" }
    }

    return NextResponse.json({
      success: true,
      data: {
        totalProducts: allProducts.length,
        products: allProducts,
        tableStructure,
        testProductResult,
      },
    })
  } catch (error) {
    console.error("Debug products error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
