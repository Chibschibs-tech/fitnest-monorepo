/**
 * Rebuilt Authentication System
 * Centralized authentication utilities with proper session validation
 */

import { sql } from "@/lib/db"
import crypto from "crypto"
import { v4 as uuidv4 } from "uuid"

// Password hashing
export function hashPassword(password: string): string {
  return crypto
    .createHash("sha256")
    .update(password + "fitnest-salt-2024")
    .digest("hex")
}

// Initialize database tables
export async function initAuthTables() {
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'customer',
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login_at TIMESTAMP
      )
    `

    // Create sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR(255) PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create indexes for performance
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`
      await sql`CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)`
      await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`
    } catch (err) {
      // Indexes might already exist
      console.log("Index creation:", err)
    }

    console.log("[AUTH] Tables initialized successfully")
    return true
  } catch (error) {
    console.error("[AUTH] Error initializing tables:", error)
    return false
  }
}

// Ensure admin user exists
export async function ensureAdminUser() {
  try {
    const adminEmail = "chihab@ekwip.ma".toLowerCase().trim()
    const adminPassword = "FITnest123!"
    const hashedPassword = hashPassword(adminPassword)

    // Check if admin exists
    const existing = await sql`
      SELECT id, email, password, role 
      FROM users 
      WHERE LOWER(email) = LOWER(${adminEmail})
    `

    if (existing.length > 0) {
      // Update existing admin
      await sql`
        UPDATE users 
        SET 
          name = 'Chihab Admin',
          password = ${hashedPassword},
          role = 'admin',
          email = ${adminEmail},
          status = 'active',
          updated_at = NOW()
        WHERE id = ${existing[0].id}
      `
      console.log("[AUTH] Admin user updated:", adminEmail)
    } else {
      // Create new admin
      await sql`
        INSERT INTO users (name, email, password, role, status)
        VALUES ('Chihab Admin', ${adminEmail}, ${hashedPassword}, 'admin', 'active')
      `
      console.log("[AUTH] Admin user created:", adminEmail)
    }

    return true
  } catch (error) {
    console.error("[AUTH] Error ensuring admin user:", error)
    return false
  }
}

// Authenticate user
export async function authenticateUser(email: string, password: string) {
  try {
    const normalizedEmail = email.toLowerCase().trim()
    const hashedPassword = hashPassword(password)

    // Find user with case-insensitive email
    const users = await sql`
      SELECT id, name, email, password, role, status
      FROM users
      WHERE LOWER(email) = LOWER(${normalizedEmail})
    `

    if (users.length === 0) {
      console.log("[AUTH] User not found:", normalizedEmail)
      return null
    }

    const user = users[0]

    // Check if user is active
    if (user.status !== "active") {
      console.log("[AUTH] User is not active:", normalizedEmail)
      return null
    }

    // Verify password
    if (user.password !== hashedPassword) {
      console.log("[AUTH] Password mismatch for:", normalizedEmail)
      return null
    }

    // Update last login
    try {
      await sql`UPDATE users SET last_login_at = NOW() WHERE id = ${user.id}`
    } catch (err) {
      // Non-critical
      console.log("[AUTH] Failed to update last_login_at:", err)
    }

    console.log("[AUTH] User authenticated:", { id: user.id, email: user.email, role: user.role })
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    }
  } catch (error) {
    console.error("[AUTH] Authentication error:", error)
    return null
  }
}

// Create session
export async function createSession(userId: number): Promise<string | null> {
  try {
    const sessionId = uuidv4()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

    await sql`
      INSERT INTO sessions (id, user_id, expires_at)
      VALUES (${sessionId}, ${userId}, ${expiresAt})
    `

    console.log("[AUTH] Session created:", { userId, sessionId: sessionId.substring(0, 10) + "..." })
    return sessionId
  } catch (error) {
    console.error("[AUTH] Error creating session:", error)
    return null
  }
}

// Get user from session
export async function getSessionUser(sessionId: string | null | undefined) {
  if (!sessionId) {
    return null
  }

  try {
    // Check if database is available
    if (!process.env.DATABASE_URL) {
      console.warn("[AUTH] DATABASE_URL not set, cannot validate session")
      return null
    }

    const sessions = await sql`
      SELECT 
        s.id as session_id,
        s.expires_at,
        u.id,
        u.name,
        u.email,
        u.role,
        u.status
      FROM sessions s
      INNER JOIN users u ON s.user_id = u.id
      WHERE s.id = ${sessionId}
      AND s.expires_at > NOW()
      AND u.status = 'active'
    `

    if (sessions.length === 0) {
      return null
    }

    const session = sessions[0]
    return {
      id: session.id,
      name: session.name,
      email: session.email,
      role: session.role,
    }
  } catch (error) {
    // Log error but don't throw - return null to indicate no valid session
    console.error("[AUTH] Error getting session user:", error)
    return null
  }
}

// Delete session
export async function deleteSession(sessionId: string) {
  try {
    await sql`DELETE FROM sessions WHERE id = ${sessionId}`
    return true
  } catch (error) {
    console.error("[AUTH] Error deleting session:", error)
    return false
  }
}

// Clean expired sessions
export async function cleanExpiredSessions() {
  try {
    const result = await sql`DELETE FROM sessions WHERE expires_at < NOW()`
    console.log("[AUTH] Cleaned expired sessions")
    return true
  } catch (error) {
    console.error("[AUTH] Error cleaning sessions:", error)
    return false
  }
}

// Create user (for registration)
export async function createUser(name: string, email: string, password: string) {
  try {
    const normalizedEmail = email.toLowerCase().trim()
    const hashedPassword = hashPassword(password)

    // Check if user already exists
    const existing = await sql`
      SELECT id FROM users WHERE LOWER(email) = LOWER(${normalizedEmail})
    `

    if (existing.length > 0) {
      return null
    }

    // Create user
    const result = await sql`
      INSERT INTO users (name, email, password, role, status)
      VALUES (${name}, ${normalizedEmail}, ${hashedPassword}, 'customer', 'active')
      RETURNING id, name, email, role
    `

    return result[0]
  } catch (error) {
    console.error("[AUTH] Error creating user:", error)
    return null
  }
}

