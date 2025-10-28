import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {

    console.log("=== COMPLETE DATABASE DIAGNOSTIC ===")

    // Get cart ID from cookie
    const cartId = request.headers
      .get("cookie")
      ?.split(";")
      .find((c) => c.trim().startsWith("cartId="))
      ?.split("=")[1]

    // 1. Get all tables in the database
    const allTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `

    // 2. Get structure for each table
    const tableStructures = {}
    for (const table of allTables) {
      const tableName = table.table_name
      const columns = await sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = ${tableName}
        ORDER BY ordinal_position
      `
      tableStructures[tableName] = columns
    }

    // 3. Check data in key tables
    const tableData = {}

    // Cart data
    if (tableStructures.cart) {
      tableData.cart = {
        total: await sql`SELECT COUNT(*) as count FROM cart`,
        sample: await sql`SELECT * FROM cart LIMIT 5`,
        userCart: cartId ? await sql`SELECT * FROM cart WHERE id = ${cartId}` : [],
      }
    }

    // Cart items data
    if (tableStructures.cart_items) {
      tableData.cart_items = {
        total: await sql`SELECT COUNT(*) as count FROM cart_items`,
        sample: await sql`SELECT * FROM cart_items LIMIT 5`,
      }
    }

    // Products data
    if (tableStructures.products) {
      tableData.products = {
        total: await sql`SELECT COUNT(*) as count FROM products`,
        sample: await sql`SELECT * FROM products LIMIT 3`,
      }
    }

    // Orders data
    if (tableStructures.orders) {
      tableData.orders = {
        total: await sql`SELECT COUNT(*) as count FROM orders`,
        sample: await sql`SELECT * FROM orders LIMIT 3`,
      }
    }

    // Order items data
    if (tableStructures.order_items) {
      tableData.order_items = {
        total: await sql`SELECT COUNT(*) as count FROM order_items`,
        sample: await sql`SELECT * FROM order_items LIMIT 3`,
      }
    }

    // Users data
    if (tableStructures.users) {
      tableData.users = {
        total: await sql`SELECT COUNT(*) as count FROM users`,
        sample: await sql`SELECT id, name, email FROM users LIMIT 3`,
      }
    }

    // 4. Analyze issues
    const issues = []
    const recommendations = []

    // Check cart system
    if (!tableStructures.cart) {
      issues.push("Cart table missing")
      recommendations.push("Create cart table")
    } else if (tableData.cart.userCart.length === 0 && cartId) {
      issues.push(`No cart data found for cart ID: ${cartId}`)
      recommendations.push("Cart ID mismatch - need to sync cart ID")
    }

    // Check products
    if (!tableStructures.products) {
      issues.push("Products table missing")
      recommendations.push("Run seed-products API")
    } else if (tableData.products.total[0].count === 0) {
      issues.push("Products table empty")
      recommendations.push("Run seed-products API")
    }

    // Check orders table structure
    if (tableStructures.orders) {
      const orderColumns = tableStructures.orders.map((col) => col.column_name)
      const requiredColumns = ["id", "total", "status"]
      const missingColumns = requiredColumns.filter((col) => !orderColumns.includes(col))
      if (missingColumns.length > 0) {
        issues.push(`Orders table missing columns: ${missingColumns.join(", ")}`)
        recommendations.push("Update orders table schema")
      }
    }

    // 5. Generate working queries
    const workingQueries = {}

    // Cart query
    if (tableStructures.cart && tableStructures.products) {
      const cartColumns = tableStructures.cart.map((col) => col.column_name)
      const productColumns = tableStructures.products.map((col) => col.column_name)

      workingQueries.getCartItems = `
        SELECT 
          c.id as cart_id,
          c.product_id,
          c.quantity,
          p.name,
          p.${productColumns.includes("price") ? "price" : "cost"} as price,
          ${productColumns.includes("saleprice") ? "p.saleprice" : "NULL"} as sale_price
        FROM cart c
        JOIN products p ON c.product_id = p.id
        WHERE c.id = $1
      `
    }

    // Order creation query
    if (tableStructures.orders) {
      const orderColumns = tableStructures.orders.map((col) => col.column_name)
      const insertColumns = orderColumns.filter((col) => !["id", "created_at", "updated_at"].includes(col))

      workingQueries.createOrder = `
        INSERT INTO orders (${insertColumns.join(", ")})
        VALUES (${insertColumns.map((_, i) => `$${i + 1}`).join(", ")})
        RETURNING id
      `
    }

    console.log("Database diagnostic complete")
    console.log("Issues found:", issues)
    console.log("Recommendations:", recommendations)

    return NextResponse.json({
      cartId,
      tables: allTables.map((t) => t.table_name),
      tableStructures,
      tableData,
      issues,
      recommendations,
      workingQueries,
      summary: {
        totalTables: allTables.length,
        totalIssues: issues.length,
        cartStatus: tableData.cart ? `${tableData.cart.total[0].count} items total` : "No cart table",
        productsStatus: tableData.products ? `${tableData.products.total[0].count} products` : "No products table",
        ordersStatus: tableData.orders ? `${tableData.orders.total[0].count} orders` : "No orders table",
      },
    })
  } catch (error) {
    console.error("Complete diagnostic error:", error)
    return NextResponse.json({
      error: "Diagnostic failed",
      details: error instanceof Error ? error.message : String(error),
    })
  }
}
