import { type NextRequest, NextResponse } from "next/server"
import { sql, db } from "@/lib/db"

// Force dynamic to prevent caching issues
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 20

    // Build query based on parameters
    // Using the exact column names that match our new schema
    let query = `
      SELECT 
        id, 
        name, 
        description, 
        price, 
        saleprice as "salePrice", 
        imageurl as "imageUrl", 
        category,
        tags,
        stock,
        isactive as "isActive"
      FROM products
      WHERE 1=1
    `

    const queryParams = []

    if (category) {
      query += ` AND category = $1`
      queryParams.push(category)
    }

    query += ` AND isactive = true`
    query += ` ORDER BY id ASC LIMIT $${queryParams.length + 1}`
    queryParams.push(limit)

    console.log("Executing query:", query, "with params:", queryParams)

    // Execute query
    const result = await q(query, queryParams)

    console.log(`Query returned ${result.rows.length} products`)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch products",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

async function createProductsTable(sql) {
  // Create a basic products table with camelCase/lowercase column names
  // since that seems to be what your database is using
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      saleprice DECIMAL(10, 2),
      category TEXT,
      imageurl TEXT,
      stock INTEGER NOT NULL DEFAULT 0,
      isactive BOOLEAN DEFAULT true,
      createdat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updatedat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `

  // Seed with initial data
  await seedProducts(sql, [
    "id",
    "name",
    "description",
    "price",
    "saleprice",
    "category",
    "imageurl",
    "stock",
    "isactive",
  ])
}

async function seedProducts(sql, columnNames) {
  // Sample products data
  const sampleProducts = [
    {
      id: "protein-bar-1",
      name: "Protein Bar - Chocolate",
      description: "Delicious chocolate protein bar with 20g of protein.",
      price: 25.99,
      saleprice: null,
      category: "protein_bars",
      imageurl: "/protein-bar.png",
      stock: 100,
      isactive: true,
    },
    {
      id: "protein-bar-2",
      name: "Protein Bar - Berry",
      description: "Delicious berry protein bar with 18g of protein.",
      price: 25.99,
      saleprice: 19.99,
      category: "protein_bars",
      imageurl: "/berry-protein-bar.png",
      stock: 75,
      isactive: true,
    },
    {
      id: "granola-1",
      name: "Honey Almond Granola",
      description: "Crunchy granola with honey and almonds.",
      price: 45.99,
      saleprice: null,
      category: "granola",
      imageurl: "/honey-almond-granola.png",
      stock: 50,
      isactive: true,
    },
    {
      id: "protein-pancake-1",
      name: "Protein Pancake Mix",
      description: "Make delicious protein pancakes at home.",
      price: 89.99,
      saleprice: 79.99,
      category: "breakfast",
      imageurl: "/healthy-protein-pancake-mix.png",
      stock: 30,
      isactive: true,
    },
  ]

  for (const product of sampleProducts) {
    // Build dynamic insert based on available columns
    const columns = ["id", "name", "description", "price"]
    const values = [product.id, product.name, product.description, product.price]
    const placeholders = ["$1", "$2", "$3", "$4"]
    let index = 5

    // Use camelCase/lowercase column names since that's what your DB is using
    if (columnNames.includes("saleprice")) {
      columns.push("saleprice")
      values.push(product.saleprice)
      placeholders.push(`$${index++}`)
    }

    if (columnNames.includes("category")) {
      columns.push("category")
      values.push(product.category)
      placeholders.push(`$${index++}`)
    }

    if (columnNames.includes("imageurl")) {
      columns.push("imageurl")
      values.push(product.imageurl)
      placeholders.push(`$${index++}`)
    }

    if (columnNames.includes("stock")) {
      columns.push("stock")
      values.push(product.stock)
      placeholders.push(`$${index++}`)
    }

    if (columnNames.includes("isactive")) {
      columns.push("isactive")
      values.push(product.isactive)
      placeholders.push(`$${index++}`)
    }

    const query = `
      INSERT INTO products (${columns.join(", ")})
      VALUES (${placeholders.join(", ")})
      ON CONFLICT (id) DO NOTHING
    `

    await q(query, values)
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.description || !data.price) {
      return NextResponse.json(
        { error: "Missing required fields: name, description, and price are required" },
        { status: 400 },
      )
    }

    // Insert using the exact column names that match our new schema
    const newProduct = await sql`
      INSERT INTO products (
        name, description, price, saleprice, imageurl, 
        category, tags, nutritionalinfo, stock, isactive
      )
      VALUES (
        ${data.name}, ${data.description}, ${data.price}, ${data.salePrice || null},
        ${data.imageUrl || null}, ${data.category || null}, ${data.tags || null},
        ${data.nutritionalInfo ? JSON.stringify(data.nutritionalInfo) : null}::jsonb,
        ${data.stock || 0}, ${data.isActive !== undefined ? data.isActive : true}
      )
      RETURNING *
    `

    // Transform response to match the expected format
    const product = newProduct[0]
    return NextResponse.json(
      {
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
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json(
      {
        error: "Failed to create product",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
