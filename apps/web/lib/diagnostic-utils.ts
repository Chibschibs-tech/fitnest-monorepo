import { sql, db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

/**
 * Diagnostic utility functions for troubleshooting Fitnest.ma application
 */

// Test database connection
export async function testDatabaseConnection() {
  try {
    const result = await sql`SELECT 1 as connection_test`
    return {
      success: true,
      message: "Database connection successful",
      details: result,
    }
  } catch (error) {
    return {
      success: false,
      message: "Database connection failed",
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

// Check if products table exists and has data
export async function checkProductsTable() {
  try {

    // Check if table exists
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'products'
    `

    if (tables.length === 0) {
      return {
        success: false,
        message: "Products table does not exist",
        recommendation: "Run the seed-products API endpoint to create and populate the products table",
      }
    }

    // Check if table has data
    const count = await sql`SELECT COUNT(*) as count FROM products`

    return {
      success: true,
      message: "Products table exists",
      hasData: count[0].count > 0,
      count: count[0].count,
      recommendation: count[0].count === 0 ? "Run the seed-products API endpoint to populate the products table" : null,
    }
  } catch (error) {
    return {
      success: false,
      message: "Failed to check products table",
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

// Check if cart table exists
export async function checkCartTable() {
  try {

    // Check if table exists
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'cart_items'
    `

    return {
      success: true,
      message: "Cart table check completed",
      exists: tables.length > 0,
      recommendation: tables.length === 0 ? "Run the ensure-cart-table API endpoint to create the cart table" : null,
    }
  } catch (error) {
    return {
      success: false,
      message: "Failed to check cart table",
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

// Test authentication
export async function checkAuthentication() {
  try {
    const session = await getServerSession(authOptions)

    return {
      success: true,
      isAuthenticated: !!session?.user,
      user: session?.user
        ? {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
          }
        : null,
    }
  } catch (error) {
    return {
      success: false,
      message: "Failed to check authentication",
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

// Check API endpoints
export async function checkApiEndpoint(endpoint: string) {
  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      data,
    }
  } catch (error) {
    return {
      success: false,
      message: `Failed to check API endpoint: ${endpoint}`,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
