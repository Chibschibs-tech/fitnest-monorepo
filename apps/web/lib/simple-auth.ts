/**
 * Compatibility layer - re-exports from new auth.ts
 * This allows existing code to continue working without changes
 */

export {
  hashPassword as simpleHash,
  initAuthTables as initTables,
  ensureAdminUser,
  authenticateUser,
  createSession,
  getSessionUser,
  deleteSession,
} from "./auth"

// Legacy function names for backward compatibility
import { hashPassword, createUser as createUserNew } from "./auth"
import { sql } from "./db"

export function simpleHash(password: string): string {
  return hashPassword(password)
}

export async function createUser(name: string, email: string, password: string) {
  try {
    const normalizedEmail = email.toLowerCase().trim()
    const hashedPassword = hashPassword(password)

    // Check if user already exists
    const existingUser = await sql`SELECT id FROM users WHERE LOWER(email) = LOWER(${normalizedEmail})`
    if (existingUser.length > 0) {
      return null
    }

    // Create user
    const result = await sql`
      INSERT INTO users (name, email, password)
      VALUES (${name}, ${normalizedEmail}, ${hashedPassword})
      RETURNING id, name, email, role
    `

    return result[0]
  } catch (error) {
    console.error("Error creating user:", error)
    return null
  }
}
