import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {

    // Check if products table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'products'
      ) as exists
    `

    if (!tableExists[0].exists) {
      // Create the products table with camelCase column names
      await sql`
        CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT NOT NULL,
          price DECIMAL(10, 2) NOT NULL,
          saleprice DECIMAL(10, 2),
          category TEXT,
          imageurl TEXT,
          stock INTEGER NOT NULL DEFAULT 0,
          isactive BOOLEAN DEFAULT true
        )
      `
    }

    // Sample products data
    const sampleProducts = [
      {
        id: "protein-bar-1",
        name: "Protein Bar - Chocolate",
        description: "Delicious chocolate protein bar with 20g of protein.",
        price: 25.99,
        saleprice: null,
        category: "protein_bars",
        imageurl: "/protein-bar.png",
        stock: 100,
      },
      {
        id: "protein-bar-2",
        name: "Protein Bar - Berry",
        description: "Delicious berry protein bar with 18g of protein.",
        price: 25.99,
        saleprice: 19.99,
        category: "protein_bars",
        imageurl: "/berry-protein-bar.png",
        stock: 75,
      },
      {
        id: "granola-1",
        name: "Honey Almond Granola",
        description: "Crunchy granola with honey and almonds.",
        price: 45.99,
        saleprice: null,
        category: "granola",
        imageurl: "/honey-almond-granola.png",
        stock: 50,
      },
      {
        id: "protein-pancake-1",
        name: "Protein Pancake Mix",
        description: "Make delicious protein pancakes at home.",
        price: 89.99,
        saleprice: 79.99,
        category: "breakfast",
        imageurl: "/healthy-protein-pancake-mix.png",
        stock: 30,
      },
      {
        id: "protein-bar-pack-1",
        name: "Protein Bar Variety Pack",
        description: "Try all our delicious protein bar flavors.",
        price: 119.99,
        saleprice: null,
        category: "protein_bars",
        imageurl: "/protein-bar-pack.png",
        stock: 25,
      },
    ]

    // Insert sample products
    let inserted = 0
    for (const product of sampleProducts) {
      await sql`
        INSERT INTO products (id, name, description, price, saleprice, category, imageurl, stock)
        VALUES (${product.id}, ${product.name}, ${product.description}, ${product.price}, 
                ${product.saleprice}, ${product.category}, ${product.imageurl}, ${product.stock})
        ON CONFLICT (id) DO UPDATE SET
          name = ${product.name},
          description = ${product.description},
          price = ${product.price},
          saleprice = ${product.saleprice},
          category = ${product.category},
          imageurl = ${product.imageurl},
          stock = ${product.stock}
      `
      inserted++
    }

    // Get product count
    const countResult = await sql`
      SELECT COUNT(*) as count FROM products
    `

    return NextResponse.json({
      success: true,
      message: "Products seeded successfully",
      inserted,
      totalProducts: Number.parseInt(countResult[0].count),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error seeding products:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to seed products",
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
