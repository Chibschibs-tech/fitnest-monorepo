export const dynamic = "force-dynamic";
export const revalidate = 0;

import { type NextRequest, NextResponse } from "next/server"
import { sql, db } from "@/lib/db"


export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const sessionId = request.cookies.get("session-id")?.value
    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all products for express shop
    const products = await sql`
      SELECT 
        id,
        name,
        description,
        price,
        sale_price,
        category,
        brand,
        image_url,
        is_active as is_available,
        stock as stock_quantity,
        created_at
      FROM products
      WHERE is_active = true
      ORDER BY created_at DESC
    `

    return NextResponse.json({
      success: true,
      products: products,
    })
  } catch (error) {
    console.error("Error fetching express shop products:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch products",
        products: [],
      },
      { status: 500 },
    )
  }
}
