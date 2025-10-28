export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { phase, confirm } = await request.json()

    if (!confirm) {
      return NextResponse.json({ error: "Migration must be confirmed" }, { status: 400 })
    }


    console.log(`=== EXECUTING MIGRATION PHASE: ${phase} ===`)

    switch (phase) {
      case "backup":
        return await executeBackupPhase(sql)
      case "migrate":
        return await executeMigrationPhase(sql)
      case "verify":
        return await executeVerificationPhase(sql)
      case "rollback":
        return await executeRollbackPhase(sql)
      default:
        return NextResponse.json({ error: "Invalid migration phase" }, { status: 400 })
    }
  } catch (error) {
    console.error("Migration execution error:", error)
    return NextResponse.json(
      {
        error: "Migration execution failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

async function executeBackupPhase(sql) {
  console.log("Creating data backups...")

  // Create backup tables
  const backupSteps = [
    "CREATE TABLE IF NOT EXISTS backup_users AS SELECT * FROM users",
    "CREATE TABLE IF NOT EXISTS backup_orders AS SELECT * FROM orders",
    "CREATE TABLE IF NOT EXISTS backup_products AS SELECT * FROM products",
    "CREATE TABLE IF NOT EXISTS backup_cart AS SELECT * FROM cart",
    "CREATE TABLE IF NOT EXISTS backup_order_items AS SELECT * FROM order_items",
  ]

  const results = []
  for (const step of backupSteps) {
    try {
      await sql.unsafe(step)
      results.push({ step, status: "success" })
    } catch (error) {
      results.push({ step, status: "error", error: error.message })
    }
  }

  return NextResponse.json({
    phase: "backup",
    status: "completed",
    results,
    message: "Data backup completed",
  })
}

async function executeMigrationPhase(sql) {
  console.log("Executing migration steps...")

  const migrationSteps = [
    // Ensure meal_plans table exists with correct structure
    `CREATE TABLE IF NOT EXISTS meal_plans (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price INTEGER NOT NULL,
      duration_weeks INTEGER DEFAULT 4,
      meals_per_week INTEGER DEFAULT 7,
      category VARCHAR(100),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )`,

    // Add missing columns to orders table
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address TEXT`,
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS billing_address TEXT`,
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_date DATE`,
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS meal_plan_data JSONB`,

    // Standardize products table
    `ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_price INTEGER`,
    `ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url VARCHAR(500)`,
    `ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true`,
    `ALTER TABLE products ADD COLUMN IF NOT EXISTS tags TEXT[]`,
    `ALTER TABLE products ADD COLUMN IF NOT EXISTS nutritional_info JSONB`,

    // Ensure cart table has proper structure
    `ALTER TABLE cart ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE`,
    `ALTER TABLE cart ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`,

    // Create default meal plan if none exists
    `INSERT INTO meal_plans (name, description, price, duration_weeks, meals_per_week, category)
     SELECT 'Express Shop Order', 'Individual product purchase', 0, 1, 0, 'express'
     WHERE NOT EXISTS (SELECT 1 FROM meal_plans)`,

    // Update any orders without plan_id
    `UPDATE orders SET plan_id = (SELECT id FROM meal_plans LIMIT 1) WHERE plan_id IS NULL`,
  ]

  const results = []
  for (const step of migrationSteps) {
    try {
      await sql.unsafe(step)
      results.push({ step: step.substring(0, 50) + "...", status: "success" })
    } catch (error) {
      results.push({ step: step.substring(0, 50) + "...", status: "error", error: error.message })
    }
  }

  return NextResponse.json({
    phase: "migrate",
    status: "completed",
    results,
    message: "Migration steps completed",
  })
}

async function executeVerificationPhase(sql) {
  console.log("Verifying migration...")

  const verificationChecks = [
    { name: "Users table", query: "SELECT COUNT(*) as count FROM users" },
    { name: "Meal plans table", query: "SELECT COUNT(*) as count FROM meal_plans" },
    { name: "Products table", query: "SELECT COUNT(*) as count FROM products" },
    { name: "Orders table", query: "SELECT COUNT(*) as count FROM orders" },
    { name: "Cart table", query: "SELECT COUNT(*) as count FROM cart" },
    { name: "Order items table", query: "SELECT COUNT(*) as count FROM order_items" },
  ]

  const results = []
  for (const check of verificationChecks) {
    try {
      const result = await sql.unsafe(check.query)
      results.push({ check: check.name, status: "success", count: result[0].count })
    } catch (error) {
      results.push({ check: check.name, status: "error", error: error.message })
    }
  }

  return NextResponse.json({
    phase: "verify",
    status: "completed",
    results,
    message: "Verification completed",
  })
}

async function executeRollbackPhase(sql) {
  console.log("Executing rollback...")

  const rollbackSteps = [
    "DROP TABLE IF EXISTS meal_plans",
    "ALTER TABLE orders DROP COLUMN IF EXISTS shipping_address",
    "ALTER TABLE orders DROP COLUMN IF EXISTS billing_address",
    "ALTER TABLE orders DROP COLUMN IF EXISTS delivery_date",
    "ALTER TABLE orders DROP COLUMN IF EXISTS meal_plan_data",
  ]

  const results = []
  for (const step of rollbackSteps) {
    try {
      await sql.unsafe(step)
      results.push({ step, status: "success" })
    } catch (error) {
      results.push({ step, status: "error", error: error.message })
    }
  }

  return NextResponse.json({
    phase: "rollback",
    status: "completed",
    results,
    message: "Rollback completed",
  })
}
