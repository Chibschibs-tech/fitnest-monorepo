import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import crypto from "crypto"

function simpleHash(password: string): string {
  return crypto
    .createHash("sha256")
    .update(password + "fitnest-salt-2024")
    .digest("hex")
}

export async function GET() {
  try {
    const adminEmail = "chihab@ekwip.ma".toLowerCase()
    const adminPassword = "FITnest123!"
    const expectedHash = simpleHash(adminPassword)

    // Check database connection
    let dbConnected = false
    let dbError = null
    try {
      await sql`SELECT 1`
      dbConnected = true
    } catch (err) {
      dbError = err instanceof Error ? err.message : String(err)
    }

    // Check if users table exists
    let usersTableExists = false
    let tableError = null
    try {
      await sql`SELECT * FROM users LIMIT 1`
      usersTableExists = true
    } catch (err) {
      tableError = err instanceof Error ? err.message : String(err)
    }

    // Find admin user
    let adminUser = null
    let adminQueryError = null
    try {
      const users = await sql`SELECT id, name, email, password, role FROM users WHERE LOWER(email) = LOWER(${adminEmail})`
      if (users.length > 0) {
        adminUser = users[0]
      }
    } catch (err) {
      adminQueryError = err instanceof Error ? err.message : String(err)
    }

    // Check all admin users
    let allAdmins = []
    try {
      allAdmins = await sql`SELECT id, name, email, role FROM users WHERE role = 'admin'`
    } catch (err) {
      // Ignore
    }

    // Verify password hash
    let passwordMatch = false
    if (adminUser) {
      passwordMatch = adminUser.password === expectedHash
    }

    // Check sessions table
    let sessionsTableExists = false
    try {
      await sql`SELECT * FROM sessions LIMIT 1`
      sessionsTableExists = true
    } catch (err) {
      // Ignore
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: {
        connected: dbConnected,
        error: dbError,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
      },
      tables: {
        users: {
          exists: usersTableExists,
          error: tableError,
        },
        sessions: {
          exists: sessionsTableExists,
        },
      },
      adminUser: {
        expectedEmail: adminEmail,
        expectedPassword: adminPassword,
        expectedHash: expectedHash.substring(0, 20) + "...",
        found: !!adminUser,
        details: adminUser ? {
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role,
          storedHash: adminUser.password?.substring(0, 20) + "...",
          passwordMatch: passwordMatch,
          hashLength: adminUser.password?.length,
        } : null,
        queryError: adminQueryError,
      },
      allAdmins: allAdmins,
      recommendations: [
        !dbConnected ? "Database connection failed - check DATABASE_URL" : null,
        !usersTableExists ? "Users table doesn't exist - run initTables()" : null,
        !adminUser ? "Admin user not found - run /api/create-admin" : null,
        adminUser && !passwordMatch ? "Password hash mismatch - update admin password" : null,
        !sessionsTableExists ? "Sessions table doesn't exist - run initTables()" : null,
      ].filter(Boolean),
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 })
  }
}

export async function POST() {
  try {
    // Force create/update admin user
    const adminEmail = "chihab@ekwip.ma".toLowerCase()
    const adminPassword = "FITnest123!"
    const hashedPassword = simpleHash(adminPassword)

    // Check if user exists
    const existingUser = await sql`SELECT id FROM users WHERE LOWER(email) = LOWER(${adminEmail})`
    
    let result
    if (existingUser.length > 0) {
      // Update existing user
      result = await sql`
        UPDATE users 
        SET name = 'Chihab Admin', password = ${hashedPassword}, role = 'admin', email = ${adminEmail}
        WHERE id = ${existingUser[0].id}
        RETURNING id, name, email, role
      `
    } else {
      // Create new user
      result = await sql`
        INSERT INTO users (name, email, password, role)
        VALUES ('Chihab Admin', ${adminEmail}, ${hashedPassword}, 'admin')
        RETURNING id, name, email, role
      `
    }

    return NextResponse.json({
      success: true,
      message: "Admin user created/updated",
      admin: result[0],
      credentials: {
        email: adminEmail,
        password: adminPassword,
      },
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 })
  }
}
