export const dynamic = "force-dynamic";
export const revalidate = 0;

import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSessionUser } from "@/lib/simple-auth"
import { createErrorResponse } from "@/lib/error-handler"

// Helper to check admin auth
async function checkAdminAuth(request: NextRequest) {
  const sessionId = request.cookies.get("session-id")?.value
  if (!sessionId) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), user: null }
  }

  const user = await getSessionUser(sessionId)
  if (!user || user.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), user: null }
  }

  return { error: null, user }
}

export async function GET(request: NextRequest) {
  try {
    const authCheck = await checkAdminAuth(request)
    if (authCheck.error) return authCheck.error

    // Query products table filtered by snack/supplement categories
    const snacks = await sql`
      SELECT 
        id,
        name,
        description,
        price,
        saleprice as sale_price,
        category,
        imageurl as image_url,
        isactive as is_available,
        stock as stock_quantity,
        created_at,
        CASE 
          WHEN isactive = false THEN 'inactive'
          WHEN stock = 0 OR stock IS NULL THEN 'out_of_stock'
          ELSE 'active'
        END as status
      FROM products
      WHERE category IN ('protein_bars', 'supplements', 'healthy_snacks', 'beverages', 'snacks', 'supplement')
      ORDER BY created_at DESC
    `

    return NextResponse.json({
      success: true,
      snacks: snacks || [],
    })
  } catch (error) {
    return createErrorResponse(error, "Failed to fetch snacks", 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const authCheck = await checkAdminAuth(request)
    if (authCheck.error) return authCheck.error

    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.price) {
      return createErrorResponse(
        new Error("Missing required fields"),
        "Missing required fields: name and price are required",
        400,
      )
    }

    // Determine status based on stock
    const status = data.stock_quantity === 0 ? 'out_of_stock' : (data.status || 'active')
    const isActive = status === 'active'

    // Insert new snack product
    const newSnack = await sql`
      INSERT INTO products (
        name, description, price, saleprice, imageurl, 
        category, stock, isactive
      )
      VALUES (
        ${data.name},
        ${data.description || null},
        ${Number(data.price)},
        ${data.sale_price ? Number(data.sale_price) : null},
        ${data.image_url || null},
        ${data.category || 'snacks'},
        ${data.stock_quantity ?? data.stock ?? 0},
        ${isActive}
      )
      RETURNING 
        id, name, description, price, saleprice as sale_price, imageurl as image_url, 
        category, stock as stock_quantity, isactive as is_available, created_at
    `

    const snack = newSnack[0]

    return NextResponse.json(
      {
        success: true,
        snack: {
          ...snack,
          status: snack.is_available ? (snack.stock_quantity === 0 ? 'out_of_stock' : 'active') : 'inactive',
        },
      },
      { status: 201 },
    )
  } catch (error) {
    return createErrorResponse(error, "Failed to create snack", 500)
  }
}
