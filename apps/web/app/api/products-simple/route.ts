import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"

// Force dynamic to prevent caching issues
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    console.log("Simple products API called")

    // Check if table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'products'
      ) as exists
    `

    if (!tableExists[0].exists) {
      console.log("Products table doesn't exist, creating it")
      // Create table with camelCase/lowercase column names
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

      // Seed with sample data
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
          isactive: true,
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
          isactive: true,
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
          isactive: true,
        },
      ]

      for (const product of sampleProducts) {
        await sql`
          INSERT INTO products (id, name, description, price, saleprice, category, imageurl, stock, isactive)
          VALUES (${product.id}, ${product.name}, ${product.description}, ${product.price}, 
                  ${product.saleprice}, ${product.category}, ${product.imageurl}, ${product.stock}, ${product.isactive})
          ON CONFLICT (id) DO NOTHING
        `
      }

      // Return the newly created products
      const products = await sql`SELECT * FROM products`
      return NextResponse.json(products)
    }

    // Check column structure to determine naming convention
    const columns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'products'
    `

    const columnNames = columns.map((col) => col.column_name)
    console.log("Available columns:", columnNames)

    // Simple query to get all products using the correct column names
    let query = `
      SELECT 
        id, 
        name, 
        description, 
        price
    `

    if (columnNames.includes("saleprice")) {
      query += `, saleprice as "salePrice"`
    }

    if (columnNames.includes("imageurl")) {
      query += `, imageurl as "imageUrl"`
    }

    if (columnNames.includes("category")) {
      query += `, category`
    }

    if (columnNames.includes("stock")) {
      query += `, stock`
    }

    query += ` FROM products`

    if (columnNames.includes("isactive")) {
      query += ` WHERE isactive = true`
    }

    query += ` LIMIT 100`

    const result = await q(query)
    console.log(`Returning ${result.rows.length} products`)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error in simple products API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch products",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
