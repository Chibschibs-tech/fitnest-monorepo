/**
 * Setup Unified Cart System
 * Creates the new cart_items table that supports both products and subscriptions
 */

import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    // Step 1: Create the new unified cart_items table
    await sql`
      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        cart_id VARCHAR(255) NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('product', 'subscription')),
        
        -- For Express Shop products
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        
        -- For Meal Plan subscriptions
        plan_name VARCHAR(100),
        meal_types TEXT[],
        days_per_week INTEGER CHECK (days_per_week >= 1 AND days_per_week <= 7),
        duration_weeks INTEGER CHECK (duration_weeks >= 1),
        
        quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
        unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
        total_price NUMERIC(10,2) NOT NULL CHECK (total_price >= 0),
        
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        
        -- Constraints: product_id required for products, plan_name required for subscriptions
        CHECK (
          (item_type = 'product' AND product_id IS NOT NULL) OR
          (item_type = 'subscription' AND plan_name IS NOT NULL)
        )
      )
    `

    // Step 2: Create indexes for performance
    await sql`CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_cart_items_type ON cart_items(item_type)`
    await sql`CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id)`

    // Step 3: Create function to update updated_at timestamp
    await sql`
      CREATE OR REPLACE FUNCTION update_cart_items_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `

    // Step 4: Create trigger for auto-updating timestamps
    await sql`
      DROP TRIGGER IF EXISTS trigger_update_cart_items_updated_at ON cart_items
    `
    await sql`
      CREATE TRIGGER trigger_update_cart_items_updated_at
      BEFORE UPDATE ON cart_items
      FOR EACH ROW
      EXECUTE FUNCTION update_cart_items_updated_at()
    `

    // Step 5: Migrate existing cart data (if cart table exists)
    try {
      const cartTableExists = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'cart'
        )
      `
      
      if (cartTableExists[0]?.exists) {
        // Check if there's data to migrate
        const existingCartCount = await sql`SELECT COUNT(*) as count FROM cart`
        const count = Number(existingCartCount[0]?.count || 0)
        
        if (count > 0) {
          // Migrate existing cart items
          await sql`
            INSERT INTO cart_items (cart_id, product_id, quantity, item_type, unit_price, total_price, created_at)
            SELECT 
              c.id as cart_id,
              c.product_id,
              c.quantity,
              'product' as item_type,
              COALESCE(p.saleprice, p.price, 0) / 100.0 as unit_price,
              COALESCE(p.saleprice, p.price, 0) / 100.0 * c.quantity as total_price,
              COALESCE(c.created_at, NOW()) as created_at
            FROM cart c
            LEFT JOIN products p ON c.product_id = p.id
            WHERE NOT EXISTS (
              SELECT 1 FROM cart_items ci 
              WHERE ci.cart_id = c.id 
              AND ci.product_id = c.product_id 
              AND ci.item_type = 'product'
            )
          `
          
          return NextResponse.json({
            success: true,
            message: "Unified cart system set up successfully",
            migrated: count,
            note: "Existing cart data has been migrated. Old cart table can be kept for backward compatibility."
          })
        }
      }
    } catch (migrationError) {
      console.warn("Cart migration skipped (table may not exist):", migrationError)
    }

    return NextResponse.json({
      success: true,
      message: "Unified cart system set up successfully",
      migrated: 0
    })
  } catch (error) {
    console.error("Error setting up unified cart:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to set up unified cart system",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

