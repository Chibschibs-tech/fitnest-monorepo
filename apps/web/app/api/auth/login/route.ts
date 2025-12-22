export const dynamic = "force-dynamic";
export const revalidate = 0;

import { type NextRequest, NextResponse } from "next/server"
import { authenticateUser, createSession, initTables } from "@/lib/simple-auth"
import { sql } from "@/lib/db"
import crypto from "crypto"

// Simple hash function using built-in crypto only
function simpleHash(password: string): string {
  return crypto
    .createHash("sha256")
    .update(password + "fitnest-salt-2024")
    .digest("hex")
}

// Ensure admin user exists with correct credentials
async function ensureAdminUser() {
  try {
    // Normalize email to lowercase
    const adminEmail = "chihab@ekwip.ma".toLowerCase()
    const adminPassword = "FITnest123!"
    const hashedPassword = simpleHash(adminPassword)

    console.log("[ENSURE_ADMIN] Ensuring admin user exists:", adminEmail)
    console.log("[ENSURE_ADMIN] Password hash:", hashedPassword.substring(0, 20) + "...")

    // Check if user exists - try direct match first
    let existingUser = await sql`SELECT id, email, password FROM users WHERE email = ${adminEmail}`
    
    // If not found, try case-insensitive
    if (existingUser.length === 0) {
      console.log("[ENSURE_ADMIN] Direct match failed, trying case-insensitive")
      existingUser = await sql`SELECT id, email, password FROM users WHERE LOWER(email) = LOWER(${adminEmail})`
    }
    
    if (existingUser.length > 0) {
      console.log("[ENSURE_ADMIN] Admin user exists:", existingUser[0])
      console.log("[ENSURE_ADMIN] Current password hash:", existingUser[0].password?.substring(0, 20) + "...")
      
      // Update existing user to ensure correct password and role (normalize email to lowercase)
      const updateResult = await sql`
        UPDATE users 
        SET name = 'Chihab Admin', password = ${hashedPassword}, role = 'admin', email = ${adminEmail}
        WHERE id = ${existingUser[0].id}
        RETURNING id, email, role
      `
      console.log("[ENSURE_ADMIN] Admin user updated:", updateResult[0])
    } else {
      console.log("[ENSURE_ADMIN] Admin user not found, creating new one")
      // Create new admin user with lowercase email
      const insertResult = await sql`
        INSERT INTO users (name, email, password, role)
        VALUES ('Chihab Admin', ${adminEmail}, ${hashedPassword}, 'admin')
        RETURNING id, email, role
      `
      console.log("[ENSURE_ADMIN] Admin user created:", insertResult[0])
    }
  } catch (error) {
    console.error("[ENSURE_ADMIN] Error ensuring admin user:", error)
    console.error("[ENSURE_ADMIN] Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    // Don't throw - we'll try to continue with login
  }
}

export async function POST(request: NextRequest) {
  try {
    await initTables()
    // Ensure admin user exists with correct credentials
    await ensureAdminUser()

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    // Normalize email to lowercase for consistent comparison
    const normalizedEmail = email.toLowerCase().trim()

    console.log("[LOGIN] Login attempt for:", normalizedEmail)
    console.log("[LOGIN] Environment:", process.env.NODE_ENV)
    console.log("[LOGIN] Has DATABASE_URL:", !!process.env.DATABASE_URL)

    const user = await authenticateUser(normalizedEmail, password)

    if (!user) {
      console.log("Authentication failed for:", normalizedEmail)
      // If it's the admin email (case-insensitive), try to ensure admin user exists again and retry
      if (normalizedEmail === "chihab@ekwip.ma") {
        console.log("Retrying admin user creation for:", normalizedEmail)
        await ensureAdminUser()
        const retryUser = await authenticateUser(normalizedEmail, password)
        if (retryUser) {
          console.log("Admin user authenticated after retry")
          const sessionId = await createSession(retryUser.id)
          if (!sessionId) {
            return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
          }
          const response = NextResponse.json({
            success: true,
            user: {
              id: retryUser.id,
              name: retryUser.name,
              email: retryUser.email,
              role: retryUser.role,
            },
          })
          response.cookies.set("session-id", sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
          })
          return response
        }
      }
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Update last_login_at (Phase 2)
    try {
      const { sql } = await import("@/lib/db")
      await sql`UPDATE users SET last_login_at = NOW() WHERE id = ${user.id}`
    } catch (err) {
      console.log("Failed to update last_login_at:", err)
      // Non-critical, continue with login
    }

    const sessionId = await createSession(user.id)

    if (!sessionId) {
      return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })

    response.cookies.set("session-id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
