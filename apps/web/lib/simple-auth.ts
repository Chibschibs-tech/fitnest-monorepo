import { sql, db } from "@/lib/db"
import crypto from "crypto"
import { v4 as uuidv4 } from "uuid"


// Simple hash function using built-in crypto only
function simpleHash(password: string): string {
  return crypto
    .createHash("sha256")
    .update(password + "fitnest-salt-2024")
    .digest("hex")
}

export async function initTables() {
  try {
    // Create users table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'customer',
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Add status column if it doesn't exist (for existing tables)
    try {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'`
    } catch (err) {
      // Column might already exist, ignore error
      console.log("Status column check:", err)
    }

    // Add phone column if it doesn't exist (Phase 2)
    try {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20)`
    } catch (err) {
      console.log("Phone column check:", err)
    }

    // Add admin_notes column if it doesn't exist (Phase 2)
    try {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_notes TEXT`
    } catch (err) {
      console.log("Admin notes column check:", err)
    }

    // Add last_login_at column if it doesn't exist (Phase 2)
    try {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP`
    } catch (err) {
      console.log("Last login column check:", err)
    }

    // Create sessions table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR(255) PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    console.log("Tables initialized successfully")
    return true
  } catch (error) {
    console.error("Error initializing tables:", error)
    return false
  }
}

export async function createUser(name: string, email: string, password: string) {
  try {
    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim()
    
    // Check if user already exists using case-insensitive comparison
    const existingUser = await sql`SELECT id FROM users WHERE LOWER(email) = LOWER(${normalizedEmail})`
    if (existingUser.length > 0) {
      return null
    }

    // Hash password with crypto
    const hashedPassword = simpleHash(password)

    // Create user with normalized email
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

export async function authenticateUser(email: string, password: string) {
  try {
    // Normalize email to lowercase for case-insensitive comparison
    const normalizedEmail = email.toLowerCase().trim()
    
    // Get user using case-insensitive comparison
    const users = await sql`SELECT * FROM users WHERE LOWER(email) = LOWER(${normalizedEmail})`
    const user = users[0]

    if (!user) {
      console.log("User not found:", normalizedEmail)
      return null
    }

    // Verify password
    const hashedPassword = simpleHash(password)
    if (hashedPassword !== user.password) {
      console.log("Password mismatch for user:", normalizedEmail)
      return null
    }

    console.log("User authenticated successfully:", normalizedEmail)
    // Return user without password
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    }
  } catch (error) {
    console.error("Error authenticating user:", error)
    return null
  }
}

export async function createSession(userId: number) {
  try {
    console.log("Creating session for user ID:", userId)

    // Ensure sessions table exists
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR(255) PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    const sessionId = uuidv4()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days from now

    console.log("Session details:", { sessionId, userId, expiresAt })

    const result = await sql`
      INSERT INTO sessions (id, user_id, expires_at)
      VALUES (${sessionId}, ${userId}, ${expiresAt})
      RETURNING id
    `

    console.log("Session created successfully:", result)
    return sessionId
  } catch (error) {
    console.error("Error creating session:", error)
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      userId,
    })
    return null
  }
}

export async function getSessionUser(sessionId: string) {
  try {
    const sessions = await sql`
      SELECT s.*, u.id as user_id, u.name, u.email, u.role
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ${sessionId}
      AND s.expires_at > NOW()
    `

    const session = sessions[0]
    if (!session) {
      return null
    }

    return {
      id: session.user_id,
      name: session.name,
      email: session.email,
      role: session.role,
    }
  } catch (error) {
    console.error("Error getting session user:", error)
    return null
  }
}

export async function deleteSession(sessionId: string) {
  try {
    await sql`DELETE FROM sessions WHERE id = ${sessionId}`
    return true
  } catch (error) {
    console.error("Error deleting session:", error)
    return false
  }
}

// Create admin user if it doesn't exist
export async function ensureAdminUser() {
  try {
    const adminEmail = "admin@fitnest.ma"
    const existingAdmin = await sql`SELECT id FROM users WHERE email = ${adminEmail}`

    if (existingAdmin.length === 0) {
      const hashedPassword = simpleHash("admin123")

      await sql`
        INSERT INTO users (name, email, password, role)
        VALUES ('Admin', ${adminEmail}, ${hashedPassword}, 'admin')
      `
      console.log("Admin user created")
    }

    return true
  } catch (error) {
    console.error("Error ensuring admin user:", error)
    return false
  }
}
