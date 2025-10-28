export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"

export async function GET() {
  try {

    // Check if products table exists
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'products'
    `

    // Create products table if it doesn't exist
    if (tables.length === 0) {
      await sql`
        CREATE TABLE products (
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
    }

    // Check if products exist
    const productCount = await sql`SELECT COUNT(*) as count FROM products`

    // Only seed if no products exist
    if (productCount[0].count === 0) {
      // Insert products
      await sql`
        INSERT INTO products (name, description, price, saleprice, imageurl, category, stock)
        VALUES 
          ('Protein Bar', 'Delicious protein bar with 20g of protein', 15.99, NULL, '/protein-bar.png', 'snacks', 100),
          ('Berry Protein Bar', 'Berry flavored protein bar with 18g of protein', 16.99, 14.99, '/berry-protein-bar.png', 'snacks', 80),
          ('Chocolate Peanut Butter Protein Bars', 'Rich chocolate and peanut butter protein bars', 39.99, 34.99, '/chocolate-peanut-butter-protein-bars.png', 'snacks', 50),
          ('Protein Bar Variety Pack', 'Try all our delicious protein bar flavors', 45.99, NULL, '/protein-bar-variety-pack.png', 'snacks', 40),
          ('Honey Almond Granola', 'Crunchy granola with honey and almonds', 12.99, NULL, '/honey-almond-granola.png', 'breakfast', 60),
          ('Maple Pecan Granola - Medium Pack', 'Sweet maple granola with pecans', 18.99, 16.99, '/maple-pecan-granola-medium-pack.png', 'breakfast', 45),
          ('Maple Pecan Granola - Large Pack', 'Sweet maple granola with pecans - family size', 29.99, 26.99, '/maple-pecan-granola-large-pack.png', 'breakfast', 30),
          ('Healthy Protein Pancake Mix', 'Make delicious protein-packed pancakes at home', 24.99, NULL, '/healthy-protein-pancake-mix.png', 'breakfast', 25),
          ('Energy Drink', 'Natural energy drink with vitamins', 12.99, NULL, '/vibrant-energy-drink.png', 'drinks', 120),
          ('Protein Powder', 'Whey protein powder for muscle recovery', 49.99, 44.99, '/protein-powder-assortment.png', 'supplements', 35)
      `
    }

    // Get count of products after seeding
    const finalCount = await sql`SELECT COUNT(*) as count FROM products`

    return NextResponse.json({
      success: true,
      message: "Products seeded successfully",
      count: finalCount[0].count,
    })
  } catch (error) {
    console.error("Error seeding products:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to seed products",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
