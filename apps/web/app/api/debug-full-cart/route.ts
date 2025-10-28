import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {

    // Get cart ID from headers
    const cartId = request.headers
      .get("cookie")
      ?.split(";")
      .find((c) => c.trim().startsWith("cartId="))
      ?.split("=")[1]

    // Check if cart table exists
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `

    const hasCartTable = tables.some((t) => t.table_name === "cart")
    const hasCartItemsTable = tables.some((t) => t.table_name === "cart_items")
    const hasProductsTable = tables.some((t) => t.table_name === "products")

    let cartData = []
    let cartItemsData = []
    let productsData = []

    // Get cart data if table exists
    if (hasCartTable) {
      try {
        cartData = await sql`SELECT * FROM cart LIMIT 10`
      } catch (error) {
        console.log("Error getting cart data:", error.message)
      }
    }

    // Get cart items data if table exists
    if (hasCartItemsTable) {
      try {
        cartItemsData = await sql`SELECT * FROM cart_items LIMIT 10`
      } catch (error) {
        console.log("Error getting cart items data:", error.message)
      }
    }

    // Get products data if table exists
    if (hasProductsTable) {
      try {
        productsData = await sql`SELECT * FROM products LIMIT 5`
      } catch (error) {
        console.log("Error getting products data:", error.message)
      }
    }

    return NextResponse.json({
      cartId,
      tables: {
        hasCartTable,
        hasCartItemsTable,
        hasProductsTable,
      },
      data: {
        cart: cartData,
        cartItems: cartItemsData,
        products: productsData,
      },
      summary: {
        cartCount: cartData.length,
        cartItemsCount: cartItemsData.length,
        productsCount: productsData.length,
      },
    })
  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json({
      error: "Failed to debug cart",
      details: error instanceof Error ? error.message : String(error),
    })
  }
}
