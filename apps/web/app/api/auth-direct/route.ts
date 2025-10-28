import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql, db } from "@/lib/db"
import { decrypt } from "@/lib/jwt"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const cookieStore = cookies()
    const cookieNames = cookieStore.getAll().map((cookie) => cookie.name)
    const nextAuthToken = cookieStore.get("next-auth.session-token")?.value
    const nextAuthCallbackUrl = cookieStore.get("next-auth.callback-url")?.value
    const nextAuthCsrfToken = cookieStore.get("next-auth.csrf-token")?.value
    const jwtToken = cookieStore.get("session")?.value


    let user = null
    let isAuthenticated = false
    let authMethod = null

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

          // Get the user from the users table
          const users = await sql`
            SELECT * FROM users WHERE id = ${session.user_id} LIMIT 1
          `

          if (users.length > 0) {
            user = {
              id: users[0].id,
              name: users[0].name,
              email: users[0].email,
            }
            isAuthenticated = true
            authMethod = "nextauth"
          }
        }
      }
    }

    // If NextAuth didn't work, try custom JWT
    if (!isAuthenticated && jwtToken) {
      try {
        // Decrypt the JWT token
        const payload = await decrypt(jwtToken)

        if (payload && payload.id) {
          // Verify the user exists in the database
          const users = await sql`
            SELECT * FROM users WHERE id = ${payload.id} LIMIT 1
          `

          if (users.length > 0) {
            user = {
              id: users[0].id,
              name: users[0].name,
              email: users[0].email,
            }
            isAuthenticated = true
            authMethod = "jwt"
          }
        }
      } catch (jwtError) {
        console.error("JWT decryption error:", jwtError)
      }
    }

    return NextResponse.json({
      status: "success",
      cookies: {
        names: cookieNames,
        hasNextAuthSession: !!nextAuthToken,
        hasNextAuthCallbackUrl: !!nextAuthCallbackUrl,
        hasNextAuthCsrfToken: !!nextAuthCsrfToken,
        hasJWT: !!jwtToken,
        sessionToken: nextAuthToken ? "[REDACTED]" : null,
        jwtToken: jwtToken ? "[REDACTED]" : null,
      },
      user,
      isAuthenticated,
      authMethod,
    })
  } catch (error) {
    console.error("Error checking authentication:", error)
    return NextResponse.json({
      status: "error",
      error: error instanceof Error ? error.message : String(error),
      isAuthenticated: false,
    })
  }
}
