import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {

    // Create products table
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        sale_price DECIMAL(10, 2),
        category TEXT,
        image_url TEXT,
        stock INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Sample products data
    const sampleProducts = [
      {
        id: "protein-bar-1",
        name: "Protein Bar - Chocolate",
        description: "Delicious chocolate protein bar with 20g of protein.",
        price: 25.99,
        sale_price: null,
        category: "protein_bars",
        image_url: "/protein-bar.png",
        stock: 100,
      },
      {
        id: "protein-bar-2",
        name: "Protein Bar - Berry",
        description: "Delicious berry protein bar with 18g of protein.",
        price: 25.99,
        sale_price: 19.99,
        category: "protein_bars",
        image_url: "/berry-protein-bar.png",
        stock: 75,
      },
      {
        id: "granola-1",
        name: "Honey Almond Granola",
        description: "Crunchy granola with honey and almonds.",
        price: 45.99,
        sale_price: null,
        category: "granola",
        image_url: "/honey-almond-granola.png",
        stock: 50,
      },
      {
        id: "protein-pancake-1",
        name: "Protein Pancake Mix",
        description: "Make delicious protein pancakes at home.",
        price: 89.99,
        sale_price: 79.99,
        category: "breakfast",
        image_url: "/healthy-protein-pancake-mix.png",
        stock: 30,
      },
      {
        id: "protein-bar-pack-1",
        name: "Protein Bar Variety Pack",
        description: "Try all our delicious protein bar flavors.",
        price: 119.99,
        sale_price: null,
        category: "protein_bars",
        image_url: "/protein-bar-pack.png",
        stock: 25,
      },
    ]

    // Insert sample products
    for (const product of sampleProducts) {
      await sql`
        INSERT INTO products (id, name, description, price, sale_price, category, image_url, stock)
        VALUES (${product.id}, ${product.name}, ${product.description}, ${product.price}, ${product.sale_price}, ${product.category}, ${product.image_url}, ${product.stock})
        ON CONFLICT (id) DO NOTHING
      `
    }

    // Count products
    const countResult = await sql`SELECT COUNT(*) as count FROM products`

    return NextResponse.json({
      success: true,
      message: "Products table initialized successfully",
      productCount: Number.parseInt(countResult[0].count),
    })
  } catch (error) {
    console.error("Error initializing products:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
