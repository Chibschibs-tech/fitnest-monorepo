import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export const dynamic = "force-dynamic"

/**
 * Safe setup endpoint with better error handling
 * Checks database connection first
 */
export async function GET() {
  try {
    // First, test database connection
    try {
      await sql`SELECT 1 as test`
    } catch (dbError) {
      console.error("Database connection error:", dbError)
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
          details: dbError instanceof Error ? dbError.message : String(dbError),
          troubleshooting: {
            checkDatabaseUrl: "Verify DATABASE_URL environment variable is set",
            checkDatabaseRunning: "Ensure database is running (docker-compose up -d)",
            checkConnection: "Verify database URL format: postgresql://user:password@host:port/database",
            localDatabase: "For local: postgresql://fitnest:fitnest_dev_password@localhost:5433/fitnest_db",
          },
        },
        { status: 500 }
      )
    }

    // Check if table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'cart_items'
      )
    `

    if (tableExists[0]?.exists) {
      // Check if table has correct structure
      const columns = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'cart_items' 
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `

      const hasItemType = columns.some((c: any) => c.column_name === 'item_type')
      const hasPlanName = columns.some((c: any) => c.column_name === 'plan_name')

      if (hasItemType && hasPlanName) {
        return NextResponse.json({
          success: true,
          message: "cart_items table exists with correct structure",
          columns: columns.map((c: any) => c.column_name),
        })
      } else {
        // Table exists but wrong structure - need to migrate
        return NextResponse.json({
          success: false,
          message: "cart_items table exists but has wrong structure",
          needsMigration: true,
          columns: columns.map((c: any) => c.column_name),
        })
      }
    }

    // Create cart_items table
    await sql`
      CREATE TABLE cart_items (
        id SERIAL PRIMARY KEY,
        cart_id VARCHAR(255) NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('product', 'subscription')),
        
        -- For Express Shop products
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        
        -- For Meal Plan subscriptions
        plan_name VARCHAR(100),
        meal_types TEXT[],
        days_per_week INTEGER,
        duration_weeks INTEGER,
        
        quantity INTEGER DEFAULT 1 NOT NULL,
        unit_price NUMERIC(10,2) NOT NULL,
        total_price NUMERIC(10,2) NOT NULL,
        
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        
        -- Constraints
        CHECK (
          (item_type = 'product' AND product_id IS NOT NULL) OR
          (item_type = 'subscription' AND plan_name IS NOT NULL)
        )
      )
    `

    // Create indexes for performance
    await sql`CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_cart_items_type ON cart_items(item_type)`
    await sql`CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id)`

    // Create function to update updated_at timestamp
    await sql`
      CREATE OR REPLACE FUNCTION update_cart_items_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `

    // Create trigger for auto-updating timestamps
    await sql`
      DROP TRIGGER IF EXISTS update_cart_items_updated_at ON cart_items
    `
    await sql`
      CREATE TRIGGER update_cart_items_updated_at
      BEFORE UPDATE ON cart_items
      FOR EACH ROW
      EXECUTE FUNCTION update_cart_items_updated_at()
    `

    return NextResponse.json({
      success: true,
      message: "cart_items table created successfully",
    })
  } catch (error) {
    console.error("Error setting up cart_items table:", error)
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : String(error)
    const isConnectionError = errorMessage.includes("fetch failed") || 
                              errorMessage.includes("ECONNREFUSED") ||
                              errorMessage.includes("connection")

    return NextResponse.json(
      {
        success: false,
        error: "Failed to setup cart_items table",
        details: errorMessage,
        isConnectionError,
        troubleshooting: isConnectionError ? {
          step1: "Check if DATABASE_URL is set in your .env file",
          step2: "Verify database is running: docker-compose up -d",
          step3: "For local database, use: postgresql://fitnest:fitnest_dev_password@localhost:5433/fitnest_db",
          step4: "For Neon database, ensure URL includes ?sslmode=require",
        } : undefined,
      },
      { status: 500 }
    )
  }
}








