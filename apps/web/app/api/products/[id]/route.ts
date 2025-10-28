export const dynamic = "force-dynamic";
export const revalidate = 0;

import { type NextRequest, NextResponse } from "next/server"
import { sql, db } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
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
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product[0])
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
    }

    const data = await request.json()

    // Check if product exists
    const existingProduct = await sql`SELECT id FROM products WHERE id = ${id}`

    if (existingProduct.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
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

    if (updatedProduct.rows.length === 0) {
      return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
    }

    // Transform column names for frontend consistency
    const product = updatedProduct.rows[0]
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
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
    }


    // Check if product exists
    const existingProduct = await sql`SELECT id FROM products WHERE id = ${id}`

    if (existingProduct.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Soft delete by setting isactive to false
    await sql`UPDATE products SET isactive = false, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`

    return NextResponse.json({ success: true, message: "Product deleted successfully" })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
