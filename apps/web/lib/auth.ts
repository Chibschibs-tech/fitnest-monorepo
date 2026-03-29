/**
 * Rebuilt Authentication System
 * Centralized authentication utilities with proper session validation
 */

import { sql } from "@/lib/db"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"

const BCRYPT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (hash.length === 64 && /^[a-f0-9]+$/.test(hash)) {
    // Legacy SHA-256 hash — migrate on next login
    const crypto = await import("crypto");
    const legacyHash = crypto.createHash("sha256").update(password + "fitnest-salt-2024").digest("hex");
    return legacyHash === hash;
  }
  return bcrypt.compare(password, hash);
}

// Tables are managed via Supabase migration — no runtime DDL needed.
export async function initAuthTables() {
  console.log("[AUTH] Tables managed by Supabase migration — skipping runtime DDL");
  return true;
}

export async function ensureAdminUser() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.log("[AUTH] ADMIN_EMAIL or ADMIN_PASSWORD not set — skipping admin user setup");
      return false;
    }
    const hashedPassword = await hashPassword(adminPassword);

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
    const normalizedEmail = email.toLowerCase().trim();

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

    const passwordValid = await verifyPassword(password, user.password);
    if (!passwordValid) {
      console.log("[AUTH] Password mismatch for:", normalizedEmail);
      return null;
    }

    // Auto-migrate legacy SHA-256 hashes to bcrypt on successful login
    if (user.password.length === 64 && /^[a-f0-9]+$/.test(user.password)) {
      const bcryptHash = await hashPassword(password);
      await sql`UPDATE users SET password = ${bcryptHash}, updated_at = NOW() WHERE id = ${user.id}`;
      console.log("[AUTH] Migrated password hash to bcrypt for:", normalizedEmail);
    }

    try {
      await sql`UPDATE users SET last_login_at = NOW() WHERE id = ${user.id}`;
    } catch (err) {
      console.log("[AUTH] Failed to update last_login_at:", err);
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
    const hashedPassword = await hashPassword(password)

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

