export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    // Ensure products table exists
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        saleprice DECIMAL(10, 2),
        imageurl VARCHAR(255),
        category VARCHAR(50),
        tags VARCHAR(255),
        nutritionalinfo JSONB,
        stock INTEGER DEFAULT 0,
        isactive BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Check if products already exist
    const existingProducts = await sql`SELECT COUNT(*) as count FROM products`

    if (existingProducts.length > 0 && Number(existingProducts[0].count) > 0) {
      return NextResponse.json({ message: "Products already seeded", count: Number(existingProducts[0].count) })
    }

    // Just two simple products for testing
    const sampleProducts = [
      {
        name: "Test Protein Bar",
        description: "Test description",
        price: 25,
        salePrice: null,
        imageUrl: "/protein-bar.png",
        category: "protein_bars",
        tags: "test, protein",
        nutritionalInfo: JSON.stringify({
          calories: 240,
          protein: 20,
        }),
        stock: 100,
        isActive: true,
      },
      {
        name: "Test Granola",
        description: "Test granola description",
        price: 32,
        salePrice: null,
        imageUrl: "/honey-almond-granola.png",
        category: "granola",
        tags: "test, granola",
        nutritionalInfo: JSON.stringify({
          calories: 170,
          protein: 4,
        }),
        stock: 65,
        isActive: true,
      },
    ]

    // Insert products using raw SQL
    const insertedProducts = []
    for (const product of sampleProducts) {
      const result = await sql`
        INSERT INTO products (name, description, price, saleprice, imageurl, category, tags, nutritionalinfo, stock, isactive)
        VALUES (${product.name}, ${product.description}, ${product.price}, ${product.salePrice}, ${product.imageUrl}, ${product.category}, ${product.tags}, ${product.nutritionalInfo}::jsonb, ${product.stock}, ${product.isActive})
        RETURNING id, name, description, price, saleprice, imageurl, category, tags, nutritionalinfo, stock, isactive
      `
      insertedProducts.push(result[0])
    }

    return NextResponse.json({
      message: "Products seeded successfully",
      count: insertedProducts.length,
      products: insertedProducts,
    })
  } catch (error) {
    console.error("Error seeding products:", error)
    return NextResponse.json(
      {
        error: "Failed to seed products",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
