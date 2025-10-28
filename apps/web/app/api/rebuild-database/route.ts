import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const logs = []

    logs.push("Starting database rebuild...")

    // 1. Check existing tables
    const existingTables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `
    logs.push(`Found ${existingTables.length} existing tables: ${existingTables.map((t) => t.table_name).join(", ")}`)

    // 2. Drop existing tables if they exist
    logs.push("Dropping existing tables...")

    // Check if products table exists and drop it
    if (existingTables.some((t) => t.table_name === "products")) {
      await sql`DROP TABLE IF EXISTS products CASCADE`
      logs.push("Dropped products table")
    }

    // Check if cart_items table exists and drop it
    if (existingTables.some((t) => t.table_name === "cart_items")) {
      await sql`DROP TABLE IF EXISTS cart_items CASCADE`
      logs.push("Dropped cart_items table")
    }

    // Check if order_items table exists and drop it
    if (existingTables.some((t) => t.table_name === "order_items")) {
      await sql`DROP TABLE IF EXISTS order_items CASCADE`
      logs.push("Dropped order_items table")
    }

    // 3. Create products table with consistent naming convention
    logs.push("Creating products table...")
    await sql`
      CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        price INTEGER NOT NULL,
        saleprice INTEGER,
        imageurl VARCHAR(255),
        category VARCHAR(100),
        tags TEXT,
        nutritionalinfo JSONB,
        stock INTEGER NOT NULL DEFAULT 0,
        isactive BOOLEAN DEFAULT true NOT NULL,
        createdat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updatedat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `
    logs.push("Products table created successfully")

    // 4. Create cart_items table with consistent naming convention
    logs.push("Creating cart_items table...")
    await sql`
      CREATE TABLE cart_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL REFERENCES products(id),
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `
    logs.push("Cart_items table created successfully")

    // 5. Create order_items table with consistent naming convention
    logs.push("Creating order_items table...")
    await sql`
      CREATE TABLE order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price_at_purchase INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `
    logs.push("Order_items table created successfully")

    // 6. Seed products table with sample data
    logs.push("Seeding products table...")
    const sampleProducts = [
      {
        name: "Protein Bar - Chocolate",
        description: "Delicious chocolate protein bar with 20g of protein.",
        price: 2599, // Store price in cents/pennies to avoid floating point issues
        saleprice: null,
        category: "protein_bars",
        imageurl: "/protein-bar.png",
        stock: 100,
        isactive: true,
      },
      {
        name: "Berry Protein Bar",
        description: "Mixed berry protein bar with 18g of protein.",
        price: 2599,
        saleprice: 1999,
        category: "protein_bars",
        imageurl: "/berry-protein-bar.png",
        stock: 75,
        isactive: true,
      },
      {
        name: "Honey Almond Granola",
        description: "Crunchy granola with honey and almonds.",
        price: 4599,
        saleprice: null,
        category: "granola",
        imageurl: "/honey-almond-granola.png",
        stock: 50,
        isactive: true,
      },
      {
        name: "Protein Pancake Mix",
        description: "High-protein pancake mix for a healthy breakfast.",
        price: 8999,
        saleprice: 7999,
        category: "breakfast",
        imageurl: "/healthy-protein-pancake-mix.png",
        stock: 30,
        isactive: true,
      },
      {
        name: "Protein Bar Variety Pack",
        description: "Try all our delicious protein bar flavors.",
        price: 11999,
        saleprice: null,
        category: "protein_bars",
        imageurl: "/protein-bar-pack.png",
        stock: 25,
        isactive: true,
      },
      {
        name: "Chocolate Peanut Butter Protein Bars",
        description: "Delicious chocolate and peanut butter protein bars with 22g of protein.",
        price: 2999,
        saleprice: 2499,
        category: "protein_bars",
        imageurl: "/chocolate-peanut-butter-protein-bars.png",
        stock: 65,
        isactive: true,
      },
      {
        name: "Maple Pecan Granola (Medium Pack)",
        description: "Sweet maple and pecan granola made with whole grains.",
        price: 5599,
        saleprice: null,
        category: "granola",
        imageurl: "/maple-pecan-granola-medium-pack.png",
        stock: 45,
        isactive: true,
      },
      {
        name: "Maple Pecan Granola (Large Pack)",
        description: "Sweet maple and pecan granola made with whole grains. Family size.",
        price: 8999,
        saleprice: 7999,
        category: "granola",
        imageurl: "/maple-pecan-granola-large-pack.png",
        stock: 30,
        isactive: true,
      },
    ]

    for (const product of sampleProducts) {
      await sql`
        INSERT INTO products (
          name, description, price, saleprice, 
          category, imageurl, stock, isactive
        )
        VALUES (
          ${product.name}, ${product.description}, ${product.price}, ${product.saleprice},
          ${product.category}, ${product.imageurl}, ${product.stock}, ${product.isactive}
        )
      `
    }

    logs.push(`Added ${sampleProducts.length} products to the database`)

    // 7. Verify tables were created successfully
    const tablesAfter = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `
    logs.push(`Database now has ${tablesAfter.length} tables: ${tablesAfter.map((t) => t.table_name).join(", ")}`)

    // 8. Verify products were added successfully
    const productCount = await sql`SELECT COUNT(*) as count FROM products`
    logs.push(`Products table has ${productCount[0].count} products`)

    // 9. Check products table schema
    const productsColumns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'products'
      ORDER BY ordinal_position
    `
    logs.push(`Products table schema: ${productsColumns.map((c) => `${c.column_name} (${c.data_type})`).join(", ")}`)

    return NextResponse.json({
      success: true,
      message: "Database rebuilt successfully",
      logs,
      tables: tablesAfter.map((t) => t.table_name),
      productCount: Number(productCount[0].count),
      productsSchema: productsColumns,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error rebuilding database:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to rebuild database",
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
