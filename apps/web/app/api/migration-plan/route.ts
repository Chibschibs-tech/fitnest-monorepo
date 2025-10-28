export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"

export async function GET() {
  try {

    console.log("=== COMPREHENSIVE DATABASE ANALYSIS ===")

    // 1. Get all existing tables and their structures
    const allTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `

    const currentSchema = {}
    for (const table of allTables) {
      const tableName = table.table_name
      const columns = await sql`
        SELECT 
          column_name, 
          data_type, 
          is_nullable, 
          column_default,
          character_maximum_length
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = ${tableName}
        ORDER BY ordinal_position
      `

      const constraints = await sql`
        SELECT 
          tc.constraint_name,
          tc.constraint_type,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        LEFT JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.table_name = ${tableName}
      `

      currentSchema[tableName] = {
        columns,
        constraints,
      }
    }

    // 2. Define the target schema (what we need for the app to work properly)
    const targetSchema = {
      users: {
        columns: [
          { name: "id", type: "SERIAL PRIMARY KEY" },
          { name: "name", type: "VARCHAR(255) NOT NULL" },
          { name: "email", type: "VARCHAR(255) UNIQUE NOT NULL" },
          { name: "password", type: "VARCHAR(255)" },
          { name: "role", type: "VARCHAR(50) DEFAULT 'user'" },
          { name: "created_at", type: "TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP" },
          { name: "updated_at", type: "TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP" },
        ],
      },
      meal_plans: {
        columns: [
          { name: "id", type: "SERIAL PRIMARY KEY" },
          { name: "name", type: "VARCHAR(255) NOT NULL" },
          { name: "description", type: "TEXT" },
          { name: "price", type: "INTEGER NOT NULL" }, // in cents
          { name: "duration_weeks", type: "INTEGER DEFAULT 4" },
          { name: "meals_per_week", type: "INTEGER DEFAULT 7" },
          { name: "category", type: "VARCHAR(100)" },
          { name: "is_active", type: "BOOLEAN DEFAULT true" },
          { name: "created_at", type: "TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP" },
          { name: "updated_at", type: "TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP" },
        ],
      },
      products: {
        columns: [
          { name: "id", type: "SERIAL PRIMARY KEY" },
          { name: "name", type: "VARCHAR(255) NOT NULL" },
          { name: "description", type: "TEXT NOT NULL" },
          { name: "price", type: "INTEGER NOT NULL" }, // in cents
          { name: "sale_price", type: "INTEGER" }, // in cents
          { name: "category", type: "VARCHAR(100)" },
          { name: "image_url", type: "VARCHAR(500)" },
          { name: "stock", type: "INTEGER DEFAULT 0" },
          { name: "is_active", type: "BOOLEAN DEFAULT true" },
          { name: "tags", type: "TEXT[]" },
          { name: "nutritional_info", type: "JSONB" },
          { name: "created_at", type: "TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP" },
          { name: "updated_at", type: "TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP" },
        ],
      },
      cart: {
        columns: [
          { name: "id", type: "VARCHAR(255) PRIMARY KEY" }, // cart session ID
          { name: "user_id", type: "INTEGER REFERENCES users(id) ON DELETE CASCADE" },
          { name: "product_id", type: "INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE" },
          { name: "quantity", type: "INTEGER NOT NULL DEFAULT 1" },
          { name: "created_at", type: "TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP" },
          { name: "updated_at", type: "TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP" },
        ],
      },
      orders: {
        columns: [
          { name: "id", type: "SERIAL PRIMARY KEY" },
          { name: "user_id", type: "INTEGER NOT NULL REFERENCES users(id)" },
          { name: "plan_id", type: "INTEGER REFERENCES meal_plans(id)" },
          { name: "total_amount", type: "INTEGER NOT NULL" }, // in cents
          { name: "status", type: "VARCHAR(50) DEFAULT 'pending'" },
          { name: "shipping_address", type: "TEXT" },
          { name: "billing_address", type: "TEXT" },
          { name: "delivery_date", type: "DATE" },
          { name: "meal_plan_data", type: "JSONB" }, // for meal plan customizations
          { name: "created_at", type: "TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP" },
          { name: "updated_at", type: "TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP" },
        ],
      },
      order_items: {
        columns: [
          { name: "id", type: "SERIAL PRIMARY KEY" },
          { name: "order_id", type: "INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE" },
          { name: "product_id", type: "INTEGER REFERENCES products(id)" },
          { name: "quantity", type: "INTEGER NOT NULL" },
          { name: "price", type: "INTEGER NOT NULL" }, // price at time of purchase, in cents
          { name: "created_at", type: "TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP" },
        ],
      },
    }

    // 3. Analyze differences and create migration plan
    const migrationSteps = []
    const issues = []
    const dataBackupNeeded = []

    for (const [tableName, targetTable] of Object.entries(targetSchema)) {
      if (!currentSchema[tableName]) {
        migrationSteps.push({
          type: "CREATE_TABLE",
          table: tableName,
          sql: `CREATE TABLE ${tableName} (${targetTable.columns.map((col) => `${col.name} ${col.type}`).join(", ")})`,
        })
      } else {
        // Check for column differences
        const currentColumns = currentSchema[tableName].columns.map((col) => col.column_name)
        const targetColumns = targetTable.columns.map((col) => col.name)

        // Missing columns
        const missingColumns = targetColumns.filter((col) => !currentColumns.includes(col))
        for (const col of missingColumns) {
          const colDef = targetTable.columns.find((c) => c.name === col)
          migrationSteps.push({
            type: "ADD_COLUMN",
            table: tableName,
            column: col,
            sql: `ALTER TABLE ${tableName} ADD COLUMN ${col} ${colDef.type}`,
          })
        }

        // Extra columns (potential issues)
        const extraColumns = currentColumns.filter((col) => !targetColumns.includes(col))
        if (extraColumns.length > 0) {
          issues.push({
            type: "EXTRA_COLUMNS",
            table: tableName,
            columns: extraColumns,
            action: "Review if these columns can be safely removed",
          })
        }

        // Data type mismatches
        for (const currentCol of currentSchema[tableName].columns) {
          const targetCol = targetTable.columns.find((c) => c.name === currentCol.column_name)
          if (targetCol && currentCol.data_type !== targetCol.type.split(" ")[0].toLowerCase()) {
            issues.push({
              type: "TYPE_MISMATCH",
              table: tableName,
              column: currentCol.column_name,
              current: currentCol.data_type,
              target: targetCol.type,
              action: "May require data conversion",
            })
          }
        }
      }

      // Check if table has data that needs backup
      try {
        const count = await sql`SELECT COUNT(*) as count FROM ${q(tableName)}`
        if (count[0].count > 0) {
          dataBackupNeeded.push({
            table: tableName,
            rowCount: count[0].count,
          })
        }
      } catch (e) {
        // Table doesn't exist yet
      }
    }

    // 4. Create rollback plan
    const rollbackSteps = migrationSteps.reverse().map((step) => {
      switch (step.type) {
        case "CREATE_TABLE":
          return { type: "DROP_TABLE", table: step.table, sql: `DROP TABLE IF EXISTS ${step.table}` }
        case "ADD_COLUMN":
          return {
            type: "DROP_COLUMN",
            table: step.table,
            column: step.column,
            sql: `ALTER TABLE ${step.table} DROP COLUMN IF EXISTS ${step.column}`,
          }
        default:
          return step
      }
    })

    // 5. Estimate migration time and risk
    const riskAssessment = {
      level: dataBackupNeeded.length > 0 ? "MEDIUM" : "LOW",
      estimatedDowntime: `${Math.max(5, migrationSteps.length * 2)} minutes`,
      backupRequired: dataBackupNeeded.length > 0,
      reversible: true,
      criticalTables: dataBackupNeeded.filter((t) => ["users", "orders", "products"].includes(t.table)),
    }

    return NextResponse.json({
      currentSchema: Object.keys(currentSchema),
      targetSchema: Object.keys(targetSchema),
      migrationSteps,
      rollbackSteps,
      issues,
      dataBackupNeeded,
      riskAssessment,
      executionPlan: {
        phase1: "Backup existing data",
        phase2: "Execute migration steps",
        phase3: "Verify data integrity",
        phase4: "Update application code",
        phase5: "Test all functionality",
      },
      estimatedTotalTime: "30-45 minutes",
      recommendedMaintenanceWindow: "2 hours",
    })
  } catch (error) {
    console.error("Migration analysis error:", error)
    return NextResponse.json(
      {
        error: "Migration analysis failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
