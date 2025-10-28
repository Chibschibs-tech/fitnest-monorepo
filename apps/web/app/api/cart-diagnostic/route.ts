import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Step 1: Check authentication
    const session = await getServerSession(authOptions)
    const authStatus = {
      isAuthenticated: !!session?.user,
      userId: session?.user?.id || null,
      userEmail: session?.user?.email || null,
    }

    // If not authenticated, return early with auth status only
    if (!authStatus.isAuthenticated) {
      return NextResponse.json({
        status: "error",
        message: "User not authenticated",
        authStatus,
      })
    }

    const userId = Number.parseInt(session.user.id as string)

    // Step 2: Check database connection
    let dbConnectionStatus = "success"
    let dbError = null
    try {
      await sql`SELECT 1`
    } catch (error) {
      dbConnectionStatus = "error"
      dbError = error instanceof Error ? error.message : String(error)
    }

    // Step 3: Check if cart_items table exists
    let tableExists = false
    let tableStructure = []
    try {
      const tables = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `
      const cartTableExists = tables.some((t) => t.table_name === "cart_items")
      tableExists = cartTableExists

      if (cartTableExists) {
        tableStructure = await sql`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_name = 'cart_items'
        `
      }
    } catch (error) {
      console.error("Error checking table structure:", error)
    }

    // Step 4: Check cart items for the user
    let cartItems = []
    let cartError = null
    try {
      if (tableExists) {
        cartItems = await sql`
          SELECT * FROM cart_items WHERE user_id = ${userId}
        `
      }
    } catch (error) {
      cartError = error instanceof Error ? error.message : String(error)
    }

    // Step 5: Check products table
    let productsTableExists = false
    let productsTableStructure = []
    try {
      const tables = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `
      productsTableExists = tables.some((t) => t.table_name === "products")

      if (productsTableExists) {
        productsTableStructure = await sql`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_name = 'products'
        `
      }
    } catch (error) {
      console.error("Error checking products table structure:", error)
    }

    // Return comprehensive diagnostic information
    return NextResponse.json({
      status: "success",
      authStatus,
      database: {
        connectionStatus: dbConnectionStatus,
        error: dbError,
      },
      cartTable: {
        exists: tableExists,
        structure: tableStructure,
      },
      productsTable: {
        exists: productsTableExists,
        structure: productsTableStructure,
      },
      cart: {
        items: cartItems,
        error: cartError,
      },
    })
  } catch (error) {
    console.error("Cart diagnostic error:", error)
    return NextResponse.json({
      status: "error",
      message: "Failed to run cart diagnostic",
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
