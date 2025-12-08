export const dynamic = "force-dynamic";
export const revalidate = 0;

import { type NextRequest, NextResponse } from "next/server"
import { sql, db, q } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id || isNaN(Number(id))) {
      const { Errors } = await import("@/lib/error-handler")
      throw Errors.validation("Invalid product ID")
    }


    const product = await sql`
      SELECT 
        id, 
        name, 
        description, 
        price, 
        saleprice as "salePrice", 
        imageurl as "imageUrl", 
        category,
        tags,
        nutritionalinfo as "nutritionalInfo",
        stock
      FROM products
      WHERE id = ${id} AND isactive = true
    `

    if (product.length === 0) {
      const { Errors } = await import("@/lib/error-handler")
      throw Errors.notFound("Product not found")
    }

    return NextResponse.json(product[0])
  } catch (error) {
    const { createErrorResponse } = await import("@/lib/error-handler")
    return createErrorResponse(error, "Failed to fetch product", 500)
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id || isNaN(Number(id))) {
      const { Errors } = await import("@/lib/error-handler")
      throw Errors.validation("Invalid product ID")
    }

    const data = await request.json()

    // Check if product exists
    const existingProduct = await sql`SELECT id FROM products WHERE id = ${id}`

    if (existingProduct.length === 0) {
      const { Errors } = await import("@/lib/error-handler")
      throw Errors.notFound("Product not found")
    }

    // Build update query
    let query = `UPDATE products SET updated_at = CURRENT_TIMESTAMP`
    const queryParams: any[] = []
    let paramCounter = 1

    if (data.name !== undefined) {
      query += `, name = $${paramCounter++}`
      queryParams.push(data.name)
    }

    if (data.description !== undefined) {
      query += `, description = $${paramCounter++}`
      queryParams.push(data.description)
    }

    if (data.price !== undefined) {
      query += `, price = $${paramCounter++}`
      queryParams.push(data.price)
    }

    if (data.salePrice !== undefined) {
      query += `, saleprice = $${paramCounter++}`
      queryParams.push(data.salePrice)
    }

    if (data.imageUrl !== undefined) {
      query += `, imageurl = $${paramCounter++}`
      queryParams.push(data.imageUrl)
    }

    if (data.category !== undefined) {
      query += `, category = $${paramCounter++}`
      queryParams.push(data.category)
    }

    if (data.tags !== undefined) {
      query += `, tags = $${paramCounter++}`
      queryParams.push(data.tags)
    }

    if (data.nutritionalInfo !== undefined) {
      query += `, nutritionalinfo = $${paramCounter++}::jsonb`
      queryParams.push(JSON.stringify(data.nutritionalInfo))
    }

    if (data.stock !== undefined) {
      query += `, stock = $${paramCounter++}`
      queryParams.push(data.stock)
    }

    if (data.isActive !== undefined) {
      query += `, isactive = $${paramCounter++}`
      queryParams.push(data.isActive)
    }

    query += ` WHERE id = $${paramCounter} RETURNING *`
    queryParams.push(id)

    // Execute update
    const updatedProduct = await q(query, queryParams)

    if (updatedProduct.length === 0) {
      const { Errors } = await import("@/lib/error-handler")
      throw Errors.database("Failed to update product")
    }

    // Transform column names for frontend consistency
    const product = updatedProduct[0]
    return NextResponse.json({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      salePrice: product.saleprice,
      imageUrl: product.imageurl,
      category: product.category,
      tags: product.tags,
      nutritionalInfo: product.nutritionalinfo,
      stock: product.stock,
      isActive: product.isactive,
    })
  } catch (error) {
    const { createErrorResponse } = await import("@/lib/error-handler")
    return createErrorResponse(error, "Failed to update product", 500)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id || isNaN(Number(id))) {
      const { Errors } = await import("@/lib/error-handler")
      throw Errors.validation("Invalid product ID")
    }

    // Check if product exists
    const existingProduct = await sql`SELECT id FROM products WHERE id = ${id}`

    if (existingProduct.length === 0) {
      const { Errors } = await import("@/lib/error-handler")
      throw Errors.notFound("Product not found")
    }

    // Soft delete by setting isactive to false
    await sql`UPDATE products SET isactive = false, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`

    const { createSuccessResponse } = await import("@/lib/error-handler")
    return createSuccessResponse({ message: "Product deleted successfully" })
  } catch (error) {
    const { createErrorResponse } = await import("@/lib/error-handler")
    return createErrorResponse(error, "Failed to delete product", 500)
  }
}
