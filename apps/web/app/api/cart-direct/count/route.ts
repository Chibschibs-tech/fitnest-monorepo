import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql, db } from "@/lib/db"
import { decrypt } from "@/lib/jwt"

export const dynamic = "force-dynamic"

// Helper function to get user ID from either NextAuth or custom JWT
async function getUserId() {
  const cookieStore = cookies()
  const nextAuthToken = cookieStore.get("next-auth.session-token")?.value
  const jwtToken = cookieStore.get("session")?.value


  // Try NextAuth first
  if (nextAuthToken) {
    // Check if the sessions table exists
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `

    const hasSessionsTable = tables.some((t) => t.table_name === "sessions")

    if (hasSessionsTable) {
      // Try to get the user from the sessions table
      const sessions = await sql`
        SELECT * FROM sessions WHERE session_token = ${nextAuthToken} LIMIT 1
      `

      if (sessions.length > 0) {
        const session = sessions[0]
        return session.user_id
      }
    }
  }

  // If NextAuth didn't work, try custom JWT
  if (jwtToken) {
    try {
      // Decrypt the JWT token
      const payload = await decrypt(jwtToken)

      if (payload && payload.id) {
        // Verify the user exists in the database
        const users = await sql`
          SELECT * FROM users WHERE id = ${payload.id} LIMIT 1
        `

        if (users.length > 0) {
          return users[0].id
        }
      }
    } catch (jwtError) {
      console.error("JWT decryption error:", jwtError)
    }
  }

  throw new Error("User not authenticated")
}

export async function GET() {
  try {
    let userId

    try {
      userId = await getUserId()
    } catch (error) {
      console.error("Error getting user ID:", error)
      return NextResponse.json({
        count: 0,
        error: "Not authenticated",
      })
    }


    // First, check if the cart_items table exists
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `

    const cartTableExists = tables.some((t) => t.table_name === "cart_items")

    if (!cartTableExists) {
      // Create the cart_items table
      await sql`
        CREATE TABLE IF NOT EXISTS cart_items (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL DEFAULT 1,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `

      return NextResponse.json({ count: 0 })
    }

    // Get the total number of items in the cart
    const result = await sql`
      SELECT SUM(quantity) as total
      FROM cart_items
      WHERE user_id = ${userId}
    `

    const count = result[0]?.total || 0

    return NextResponse.json({ count })
  } catch (error) {
    console.error("Error fetching cart count:", error)
    return NextResponse.json({
      count: 0,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
