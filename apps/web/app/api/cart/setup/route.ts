import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export const dynamic = "force-dynamic"

/**
 * Setup cart_items table - ensures it exists with correct structure
 * This is a one-time setup endpoint
 */
export async function GET() {
  try {
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

    // Check if products table exists, create if not
    const productsExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'products'
      )
    `
    
    if (!productsExists[0]?.exists) {
      // Create products table with basic structure
      await sql`
        CREATE TABLE products (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          price NUMERIC(10,2) NOT NULL,
          saleprice NUMERIC(10,2),
          imageurl VARCHAR(255),
          category VARCHAR(100),
          tags TEXT,
          stock INTEGER DEFAULT 0,
          isactive BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `
    }

    // Create cart_items table
    await sql`
      CREATE TABLE cart_items (
        id SERIAL PRIMARY KEY,
        cart_id VARCHAR(255) NOT NULL,
        user_id INTEGER,
        item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('product', 'subscription')),
        
        -- For Express Shop products
        product_id INTEGER,
        
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
    
    // Add foreign key constraints if tables exist
    try {
      await sql`ALTER TABLE cart_items ADD CONSTRAINT fk_cart_items_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL`
    } catch (e) {
      // Constraint might already exist, ignore
    }
    
    try {
      await sql`ALTER TABLE cart_items ADD CONSTRAINT fk_cart_items_product_id FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE`
    } catch (e) {
      // Constraint might already exist, ignore
    }

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
    return NextResponse.json(
      {
        success: false,
        error: "Failed to setup cart_items table",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

