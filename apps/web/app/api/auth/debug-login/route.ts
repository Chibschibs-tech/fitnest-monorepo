export const dynamic = "force-dynamic";
export const revalidate = 0;

import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import crypto from "crypto"

// Simple hash function using built-in crypto only
function simpleHash(password: string): string {
  return crypto
    .createHash("sha256")
    .update(password + "fitnest-salt-2024")
    .digest("hex")
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const hashedPassword = simpleHash(password)

    // Debug: Check what users exist
    const allUsers = await sql`SELECT id, email, role, LENGTH(password) as pwd_len FROM users WHERE LOWER(email) LIKE '%chihab%' OR LOWER(email) LIKE '%ekwip%'`
    
    // Debug: Try to find the exact user
    const exactUser = await sql`SELECT id, email, role, password FROM users WHERE LOWER(email) = LOWER(${normalizedEmail})`
    
    // Debug: Check password hash
    const expectedHash = simpleHash(password)
    
    // Debug: Compare hashes if user exists
    let hashMatch = false
    if (exactUser.length > 0) {
      hashMatch = exactUser[0].password === expectedHash
    }

    return NextResponse.json({
      debug: {
        inputEmail: email,
        normalizedEmail,
        inputPassword: password,
        expectedHash,
        allMatchingUsers: allUsers,
        exactUser: exactUser.length > 0 ? {
          id: exactUser[0].id,
          email: exactUser[0].email,
          role: exactUser[0].role,
          storedHashLength: exactUser[0].password?.length,
          expectedHashLength: expectedHash.length,
          hashMatch,
          storedHashPrefix: exactUser[0].password?.substring(0, 20),
          expectedHashPrefix: expectedHash.substring(0, 20),
        } : null,
        environment: {
          nodeEnv: process.env.NODE_ENV,
          hasDatabaseUrl: !!process.env.DATABASE_URL,
          databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 20),
        }
      }
    })
  } catch (error) {
    console.error("Debug login error:", error)
    return NextResponse.json({ 
      error: "Debug failed",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 })
  }
}

