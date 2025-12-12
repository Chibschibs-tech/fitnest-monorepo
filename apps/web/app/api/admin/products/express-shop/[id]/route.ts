import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSessionUser } from "@/lib/simple-auth"
import { createErrorResponse } from "@/lib/error-handler"

export const dynamic = "force-dynamic"
export const revalidate = 0

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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authCheck = await checkAdminAuth(request)
    if (authCheck.error) return authCheck.error

    const id = params.id
    if (!id || isNaN(Number(id))) {
      return createErrorResponse(new Error("Invalid product ID"), "Invalid product ID", 400)
    }

    const data = await request.json()

    // Check if product exists
    const existingProduct = await sql`SELECT id FROM products WHERE id = ${id}`
    if (existingProduct.length === 0) {
      return createErrorResponse(new Error("Product not found"), "Product not found", 404)
    }

    // Build update query - using lowercase to match actual database schema
    const updateFields: string[] = []
    const values: any[] = []
    let paramCounter = 1

    if (data.name !== undefined) {
      updateFields.push(`name = $${paramCounter++}`)
      values.push(data.name)
    }
    if (data.description !== undefined) {
      updateFields.push(`description = $${paramCounter++}`)
      values.push(data.description)
    }
    if (data.price !== undefined) {
      updateFields.push(`price = $${paramCounter++}`)
      values.push(Number(data.price))
    }
    if (data.sale_price !== undefined) {
      updateFields.push(`saleprice = $${paramCounter++}`)
      values.push(data.sale_price ? Number(data.sale_price) : null)
    }
    if (data.image_url !== undefined) {
      updateFields.push(`imageurl = $${paramCounter++}`)
      values.push(data.image_url)
    }
    if (data.category !== undefined) {
      updateFields.push(`category = $${paramCounter++}`)
      values.push(data.category)
    }
    if (data.stock_quantity !== undefined || data.stock !== undefined) {
      updateFields.push(`stock = $${paramCounter++}`)
      values.push(data.stock_quantity ?? data.stock ?? 0)
    }
    if (data.is_available !== undefined || data.is_active !== undefined) {
      updateFields.push(`isactive = $${paramCounter++}`)
      values.push(data.is_available ?? data.is_active ?? true)
    }

    if (updateFields.length === 0) {
      return createErrorResponse(new Error("No fields to update"), "No fields to update", 400)
    }

    updateFields.push(`updated_at = NOW()`)
    values.push(id) // Add ID for WHERE clause

    // Use template literal for dynamic query building, then execute with sql
    // Note: We need to use sql template tag, but it doesn't support dynamic field building well
    // So we'll use a different approach - build the query string and use q() helper
    const query = `
      UPDATE products 
      SET ${updateFields.join(", ")} 
      WHERE id = $${paramCounter}
      RETURNING 
        id, name, description, price, saleprice as sale_price, imageurl as image_url, 
        category, stock as stock_quantity, isactive as is_available, created_at
    `

    // Import q helper for parameterized queries
    const { q } = await import("@/lib/db")
    const result = await q(query, values)

    if (result.length === 0) {
      return createErrorResponse(new Error("Failed to update product"), "Failed to update product", 500)
    }

    return NextResponse.json({
      success: true,
      product: result[0],
    })
  } catch (error) {
    return createErrorResponse(error, "Failed to update product", 500)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authCheck = await checkAdminAuth(request)
    if (authCheck.error) return authCheck.error

    const id = params.id
    if (!id || isNaN(Number(id))) {
      return createErrorResponse(new Error("Invalid product ID"), "Invalid product ID", 400)
    }

    // Check if product exists
    const existingProduct = await sql`SELECT id FROM products WHERE id = ${id}`
    if (existingProduct.length === 0) {
      return createErrorResponse(new Error("Product not found"), "Product not found", 404)
    }

    // Soft delete by setting isactive to false
    await sql`UPDATE products SET isactive = false, updated_at = NOW() WHERE id = ${id}`

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    })
  } catch (error) {
    return createErrorResponse(error, "Failed to delete product", 500)
  }
}

