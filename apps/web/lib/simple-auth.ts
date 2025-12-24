/**
 * Compatibility layer - re-exports from new auth.ts
 * This allows existing code to continue working without changes
 */

import { hashPassword, initAuthTables, ensureAdminUser, authenticateUser, createSession, getSessionUser, deleteSession, createUser as createUserNew } from "./auth"
import { sql } from "./db"

// Re-export functions with legacy names
export const simpleHash = hashPassword
export const initTables = initAuthTables
export { ensureAdminUser, authenticateUser, createSession, getSessionUser, deleteSession }

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
