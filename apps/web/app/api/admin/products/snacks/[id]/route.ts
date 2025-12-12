import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSessionUser } from "@/lib/simple-auth"
import { createErrorResponse, Errors } from "@/lib/error-handler"

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

    const snackId = Number.parseInt(params.id)
    if (isNaN(snackId)) {
      return createErrorResponse(Errors.validation("Invalid snack ID"), "Invalid snack ID", 400)
    }

    const data = await request.json()

    // Check if snack exists
    const existing = await sql`SELECT id FROM products WHERE id = ${snackId}`
    if (existing.length === 0) {
      return createErrorResponse(Errors.notFound("Snack not found"), "Snack not found", 404)
    }

    // Build update query dynamically
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
    if (data.category !== undefined) {
      updateFields.push(`category = $${paramCounter++}`)
      values.push(data.category)
    }
    if (data.image_url !== undefined) {
      updateFields.push(`imageurl = $${paramCounter++}`)
      values.push(data.image_url)
    }
    if (data.stock_quantity !== undefined || data.stock !== undefined) {
      updateFields.push(`stock = $${paramCounter++}`)
      values.push(data.stock_quantity ?? data.stock ?? 0)
    }
    if (data.status !== undefined || data.is_available !== undefined) {
      const isActive = data.status === 'active' || data.is_available === true
      updateFields.push(`isactive = $${paramCounter++}`)
      values.push(isActive)
    }

    if (updateFields.length === 0) {
      return createErrorResponse(Errors.validation("No fields to update"), "No fields to update", 400)
    }

    values.push(snackId)

    // Use q() helper for parameterized queries
    const { q } = await import("@/lib/db")
    const result = await q(
      `UPDATE products SET ${updateFields.join(', ')} WHERE id = $${paramCounter} RETURNING id, name, description, price, saleprice as sale_price, imageurl as image_url, category, stock as stock_quantity, isactive as is_available, created_at`,
      values
    )

    const snack = result[0]

    return NextResponse.json({
      success: true,
      snack: {
        ...snack,
        status: snack.is_available ? (snack.stock_quantity === 0 ? 'out_of_stock' : 'active') : 'inactive',
      },
    })
  } catch (error) {
    return createErrorResponse(error, "Failed to update snack", 500)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authCheck = await checkAdminAuth(request)
    if (authCheck.error) return authCheck.error

    const snackId = Number.parseInt(params.id)
    if (isNaN(snackId)) {
      return createErrorResponse(Errors.validation("Invalid snack ID"), "Invalid snack ID", 400)
    }

    // Check if snack exists
    const existing = await sql`SELECT id FROM products WHERE id = ${snackId}`
    if (existing.length === 0) {
      return createErrorResponse(Errors.notFound("Snack not found"), "Snack not found", 404)
    }

    // Soft delete: set isactive to false
    await sql`
      UPDATE products 
      SET isactive = false
      WHERE id = ${snackId}
    `

    return NextResponse.json({
      success: true,
      message: "Snack deleted successfully",
    })
  } catch (error) {
    return createErrorResponse(error, "Failed to delete snack", 500)
  }
}

