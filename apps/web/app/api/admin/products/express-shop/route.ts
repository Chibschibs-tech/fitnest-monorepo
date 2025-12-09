export const dynamic = "force-dynamic"
export const revalidate = 0

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

    // Get all products for express shop (including inactive for admin view)
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get("include_inactive") === "true"

    let products
    if (includeInactive) {
      products = await sql`
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
          createdat as created_at
        FROM products
        ORDER BY createdat DESC
      `
    } else {
      products = await sql`
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
          createdat as created_at
        FROM products
        WHERE isactive = true
        ORDER BY createdat DESC
      `
    }

    return NextResponse.json({
      success: true,
      products: products,
    })
  } catch (error) {
    return createErrorResponse(error, "Failed to fetch products", 500)
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

    // Insert new product - using lowercase to match actual database schema
    const newProduct = await sql`
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
        ${data.category || null},
        ${data.stock_quantity ?? data.stock ?? 0},
        ${data.is_available ?? data.is_active ?? true}
      )
      RETURNING 
        id, name, description, price, saleprice as sale_price, imageurl as image_url, 
        category, stock as stock_quantity, isactive as is_available, createdat as created_at
    `

    return NextResponse.json(
      {
        success: true,
        product: newProduct[0],
      },
      { status: 201 },
    )
  } catch (error) {
    return createErrorResponse(error, "Failed to create product", 500)
  }
}
