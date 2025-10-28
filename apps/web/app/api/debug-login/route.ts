export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"
import crypto from "crypto"
import { v4 as uuidv4 } from "uuid"


function simpleHash(password: string): string {
  return crypto
    .createHash("sha256")
    .update(password + "fitnest-salt-2024")
    .digest("hex")
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    console.log("Debug login attempt for:", email)

    // Check if user exists
    const users = await sql`SELECT * FROM users WHERE email = ${email}`
    const user = users[0]

    if (!user) {
      return NextResponse.json({
        status: "error",
        message: "User not found",
        debug: { email, userExists: false },
      })
    }

    // Check password
    const hashedPassword = simpleHash(password)
    const passwordMatch = hashedPassword === user.password

    if (!passwordMatch) {
      return NextResponse.json({
        status: "error",
        message: "Password mismatch",
        debug: {
          email,
          userExists: true,
          passwordMatch: false,
          providedHash: hashedPassword.substring(0, 10) + "...",
          storedHash: user.password.substring(0, 10) + "...",
        },
      })
    }

    // Check if sessions table exists
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS sessions (
          id VARCHAR(255) PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `
    } catch (tableError) {
      console.error("Error creating sessions table:", tableError)
    }

    // Try to create session
    const sessionId = uuidv4()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    try {
      const sessionResult = await sql`
        INSERT INTO sessions (id, user_id, expires_at)
        VALUES (${sessionId}, ${user.id}, ${expiresAt})
        RETURNING id
      `

      return NextResponse.json({
        status: "success",
        message: "Login successful",
        debug: {
          email,
          userExists: true,
          passwordMatch: true,
          sessionCreated: true,
          sessionId: sessionId,
          userId: user.id,
          sessionResult,
        },
      })
    } catch (sessionError) {
      console.error("Session creation error:", sessionError)
      return NextResponse.json({
        status: "error",
        message: "Failed to create session",
        debug: {
          email,
          userExists: true,
          passwordMatch: true,
          sessionCreated: false,
          sessionError: sessionError.message,
          userId: user.id,
        },
      })
    }
  } catch (error) {
    console.error("Debug login error:", error)
    return NextResponse.json({
      status: "error",
      message: "Debug login failed",
      error: error.message,
    })
  }
}
