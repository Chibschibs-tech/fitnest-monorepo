import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export const dynamic = "force-dynamic"

/**
 * Initialize cart_items table for unified cart system
 * This creates the table if it doesn't exist
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
      return NextResponse.json({
        success: true,
        message: "cart_items table already exists",
      })
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
    await sql`
      CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id)
    `
    await sql`
      CREATE INDEX idx_cart_items_user_id ON cart_items(user_id)
    `
    await sql`
      CREATE INDEX idx_cart_items_type ON cart_items(item_type)
    `
    await sql`
      CREATE INDEX idx_cart_items_product_id ON cart_items(product_id)
    `

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
    console.error("Error creating cart_items table:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create cart_items table",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

