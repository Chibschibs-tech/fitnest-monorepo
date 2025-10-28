export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { db, products } from "@/lib/db"

export async function GET() {
  try {
    // Check if products already exist
    const existingProducts = await db.select({ count: { id: products.id } }).from(products)

    if (existingProducts.length > 0 && existingProducts[0].count > 0) {
      return NextResponse.json({ message: "Products already seeded", count: existingProducts[0].count })
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

    // Insert products
    const insertedProducts = await db.insert(products).values(sampleProducts).returning()

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
