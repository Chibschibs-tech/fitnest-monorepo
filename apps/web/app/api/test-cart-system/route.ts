import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export const dynamic = "force-dynamic"

/**
 * Comprehensive cart system test endpoint
 * Tests database connection, table existence, and basic operations
 */
export async function GET() {
  const results = {
    timestamp: new Date().toISOString(),
    tests: [] as any[],
    overall: "pending" as "success" | "failed" | "pending",
  }

  // Test 1: Database Connection
  try {
    await sql`SELECT 1 as test`
    results.tests.push({
      test: "Database Connection",
      status: "success",
      message: "Database connection successful",
    })
  } catch (error) {
    results.tests.push({
      test: "Database Connection",
      status: "failed",
      error: error instanceof Error ? error.message : String(error),
      troubleshooting: "Check DATABASE_URL environment variable",
    })
    results.overall = "failed"
    return NextResponse.json(results, { status: 500 })
  }

  // Test 2: Check if cart_items table exists
  try {
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'cart_items'
      )
    `
    const exists = tableExists[0]?.exists

    if (exists) {
      results.tests.push({
        test: "Cart Items Table Exists",
        status: "success",
        message: "cart_items table exists",
      })

      // Test 3: Check table structure
      const columns = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'cart_items' 
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `

      const requiredColumns = [
        "id",
        "cart_id",
        "item_type",
        "product_id",
        "plan_name",
        "meal_types",
        "days_per_week",
        "duration_weeks",
        "quantity",
        "unit_price",
        "total_price",
      ]

      const columnNames = columns.map((c: any) => c.column_name)
      const missingColumns = requiredColumns.filter((col) => !columnNames.includes(col))

      if (missingColumns.length === 0) {
        results.tests.push({
          test: "Table Structure",
          status: "success",
          message: "All required columns exist",
          columns: columnNames,
        })
      } else {
        results.tests.push({
          test: "Table Structure",
          status: "failed",
          message: "Missing required columns",
          missing: missingColumns,
          existing: columnNames,
        })
        results.overall = "failed"
      }
    } else {
      results.tests.push({
        test: "Cart Items Table Exists",
        status: "failed",
        message: "cart_items table does not exist",
        action: "Run /api/cart/setup to create the table",
      })
      results.overall = "failed"
    }
  } catch (error) {
    results.tests.push({
      test: "Check Cart Items Table",
      status: "failed",
      error: error instanceof Error ? error.message : String(error),
    })
    results.overall = "failed"
  }

  // Test 4: Check if products table exists (needed for cart)
  try {
    const productsExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'products'
      )
    `
    results.tests.push({
      test: "Products Table Exists",
      status: productsExists[0]?.exists ? "success" : "warning",
      message: productsExists[0]?.exists
        ? "Products table exists"
        : "Products table does not exist (needed for Express Shop)",
    })
  } catch (error) {
    results.tests.push({
      test: "Check Products Table",
      status: "failed",
      error: error instanceof Error ? error.message : String(error),
    })
  }

  // Test 5: Check if meal_type_prices table exists (needed for subscriptions)
  try {
    const pricingExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'meal_type_prices'
      )
    `
    results.tests.push({
      test: "Pricing Tables Exist",
      status: pricingExists[0]?.exists ? "success" : "warning",
      message: pricingExists[0]?.exists
        ? "meal_type_prices table exists"
        : "meal_type_prices table does not exist (needed for subscription pricing)",
    })
  } catch (error) {
    results.tests.push({
      test: "Check Pricing Tables",
      status: "warning",
      error: error instanceof Error ? error.message : String(error),
    })
  }

  // Test 6: Test basic INSERT (if table exists)
  if (results.overall !== "failed") {
    try {
      const testCartId = `test-${Date.now()}`
      // Try to insert a test record (will rollback)
      await sql`
        INSERT INTO cart_items (
          cart_id, item_type, product_id, quantity, unit_price, total_price
        )
        VALUES (
          ${testCartId}, 'product', 1, 1, 10.00, 10.00
        )
      `
      // Delete test record
      await sql`DELETE FROM cart_items WHERE cart_id = ${testCartId}`
      results.tests.push({
        test: "Basic INSERT Operation",
        status: "success",
        message: "Can insert and delete cart items",
      })
    } catch (error) {
      results.tests.push({
        test: "Basic INSERT Operation",
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
        note: "This might fail if products table doesn't exist or foreign key constraint fails",
      })
    }
  }

  // Determine overall status
  if (results.overall === "pending") {
    const hasFailures = results.tests.some((t) => t.status === "failed")
    results.overall = hasFailures ? "failed" : "success"
  }

  return NextResponse.json(results, {
    status: results.overall === "failed" ? 500 : 200,
  })
}







