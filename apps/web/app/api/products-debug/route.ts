export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"

export async function GET() {
  try {
    // Initialize the Neon SQL client

    // First, check the table structure
    const tableInfo = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'products'
    `

    console.log("Table structure:", tableInfo)

    // Get all products using raw SQL to avoid schema mismatches
    const allProducts = await sql`SELECT * FROM products`

    // Count products by category
    const categories = {}
    allProducts.forEach((product) => {
      if (!categories[product.category]) {
        categories[product.category] = 0
      }
      categories[product.category]++
    })

    return NextResponse.json({
      tableStructure: tableInfo,
      totalProducts: allProducts.length,
      activeProducts: allProducts.filter((p) => p.is_active).length,
      categories,
      products: allProducts.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        salePrice: p.sale_price,
        imageUrl: p.image_url,
        isActive: p.is_active,
      })),
    })
  } catch (error) {
    console.error("Error in products-debug:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch products for debugging",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
