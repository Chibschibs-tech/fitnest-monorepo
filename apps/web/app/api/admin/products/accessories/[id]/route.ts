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

    const accessoryId = Number.parseInt(params.id)
    if (isNaN(accessoryId)) {
      return createErrorResponse(Errors.validation("Invalid accessory ID"), "Invalid accessory ID", 400)
    }

    const data = await request.json()

    // Check if accessory exists
    const existing = await sql`SELECT id FROM products WHERE id = ${accessoryId}`
    if (existing.length === 0) {
      return createErrorResponse(Errors.notFound("Accessory not found"), "Accessory not found", 404)
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
    // Note: brand column may not exist in all products table schemas
    // We'll try to update it, but if it fails, we'll skip it
    if (data.brand !== undefined) {
      // Only add brand if it's not null/empty (some schemas don't have brand)
      // We'll handle the error gracefully if column doesn't exist
      updateFields.push(`brand = $${paramCounter++}`)
      values.push(data.brand)
    }
    if (data.image_url !== undefined) {
      updateFields.push(`imageurl = $${paramCounter++}`)
      values.push(data.image_url)
    }
    if (data.stock_quantity !== undefined || data.stock !== undefined) {
      updateFields.push(`stock = $${paramCounter++}`)
      values.push(data.stock_quantity ?? data.stock ?? 0)
    }
    if (data.is_available !== undefined) {
      updateFields.push(`isactive = $${paramCounter++}`)
      values.push(data.is_available)
    }

    if (updateFields.length === 0) {
      return createErrorResponse(Errors.validation("No fields to update"), "No fields to update", 400)
    }

    values.push(accessoryId)

    // Use q() helper for parameterized queries
    const { q } = await import("@/lib/db")
    
    // Try with brand, if it fails, retry without brand
    try {
      const result = await q(
        `UPDATE products SET ${updateFields.join(', ')} WHERE id = $${paramCounter} RETURNING id, name, description, price, saleprice as sale_price, category, brand, imageurl as image_url, stock as stock_quantity, isactive as is_available, created_at`,
        values
      )

      const accessory = result[0]

      return NextResponse.json({
        success: true,
        accessory: {
          id: accessory.id,
          name: accessory.name,
          description: accessory.description || '',
          price: Number(accessory.price) || 0,
          sale_price: accessory.sale_price ? Number(accessory.sale_price) : null,
          category: accessory.category,
          brand: accessory.brand || data.brand || null,
          image_url: accessory.image_url,
          stock_quantity: accessory.stock_quantity || 0,
          is_available: accessory.is_available,
          created_at: accessory.created_at,
        },
      })
    } catch (error: any) {
      // If brand column doesn't exist, remove it from update and retry
      if (error.message?.includes('brand') || error.message?.includes('column')) {
        const brandIndex = updateFields.findIndex(f => f.includes('brand'))
        if (brandIndex !== -1) {
          updateFields.splice(brandIndex, 1)
          values.splice(brandIndex, 1)
          paramCounter-- // Adjust counter
        }
        
        const result = await q(
          `UPDATE products SET ${updateFields.join(', ')} WHERE id = $${paramCounter} RETURNING id, name, description, price, saleprice as sale_price, category, imageurl as image_url, stock as stock_quantity, isactive as is_available, created_at`,
          values
        )

        const accessory = result[0]

        return NextResponse.json({
          success: true,
          accessory: {
            id: accessory.id,
            name: accessory.name,
            description: accessory.description || '',
            price: Number(accessory.price) || 0,
            sale_price: accessory.sale_price ? Number(accessory.sale_price) : null,
            category: accessory.category,
            brand: data.brand || null, // Include brand in response even if not in DB
            image_url: accessory.image_url,
            stock_quantity: accessory.stock_quantity || 0,
            is_available: accessory.is_available,
            created_at: accessory.created_at,
          },
        })
      }
      throw error
    }
  } catch (error) {
    return createErrorResponse(error, "Failed to update accessory", 500)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authCheck = await checkAdminAuth(request)
    if (authCheck.error) return authCheck.error

    const accessoryId = Number.parseInt(params.id)
    if (isNaN(accessoryId)) {
      return createErrorResponse(Errors.validation("Invalid accessory ID"), "Invalid accessory ID", 400)
    }

    // Check if accessory exists
    const existing = await sql`SELECT id FROM products WHERE id = ${accessoryId}`
    if (existing.length === 0) {
      return createErrorResponse(Errors.notFound("Accessory not found"), "Accessory not found", 404)
    }

    // Soft delete: set isactive to false
    await sql`
      UPDATE products 
      SET isactive = false
      WHERE id = ${accessoryId}
    `

    return NextResponse.json({
      success: true,
      message: "Accessory deleted successfully",
    })
  } catch (error) {
    return createErrorResponse(error, "Failed to delete accessory", 500)
  }
}

