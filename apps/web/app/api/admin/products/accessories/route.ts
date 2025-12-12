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

    // Get accessories from products table
    const accessories = await sql`
      SELECT 
        id,
        name,
        description,
        price,
        saleprice as sale_price,
        category,
        brand,
        imageurl as image_url,
        isactive as is_available,
        stock as stock_quantity,
        created_at
      FROM products
      WHERE category IN ('bag', 'bottle', 'apparel', 'equipment', 'accessory')
      ORDER BY created_at DESC
    `

    return NextResponse.json({
      success: true,
      accessories: accessories || [],
    })
  } catch (error) {
    return createErrorResponse(error, "Failed to fetch accessories", 500)
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

    // Insert new accessory product
    // Note: brand column may not exist, so we'll try without it first
    try {
      const newAccessory = await sql`
        INSERT INTO products (
          name, description, price, saleprice, imageurl, 
          category, brand, stock, isactive
        )
        VALUES (
          ${data.name},
          ${data.description || null},
          ${Number(data.price)},
          ${data.sale_price ? Number(data.sale_price) : null},
          ${data.image_url || null},
          ${data.category || 'accessory'},
          ${data.brand || null},
          ${data.stock_quantity ?? data.stock ?? 0},
          ${data.is_available ?? true}
        )
        RETURNING 
          id, name, description, price, saleprice as sale_price, imageurl as image_url, 
          category, brand, stock as stock_quantity, isactive as is_available, created_at
      `
      return NextResponse.json(
        {
          success: true,
          accessory: newAccessory[0],
        },
        { status: 201 },
      )
    } catch (error: any) {
      // If brand column doesn't exist, try without it
      if (error.message?.includes('brand') || error.message?.includes('column')) {
        const newAccessory = await sql`
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
            ${data.category || 'accessory'},
            ${data.stock_quantity ?? data.stock ?? 0},
            ${data.is_available ?? true}
          )
          RETURNING 
            id, name, description, price, saleprice as sale_price, imageurl as image_url, 
            category, stock as stock_quantity, isactive as is_available, created_at
        `
        const accessory = newAccessory[0]
        return NextResponse.json(
          {
            success: true,
            accessory: {
              ...accessory,
              brand: data.brand || null, // Add brand to response even if not in DB
            },
          },
          { status: 201 },
        )
      }
      throw error
    }

    return NextResponse.json(
      {
        success: true,
        accessory: newAccessory[0],
      },
      { status: 201 },
    )
  } catch (error) {
    return createErrorResponse(error, "Failed to create accessory", 500)
  }
}
