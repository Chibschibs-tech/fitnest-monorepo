// Script to create admin user
import { neon } from "@neondatabase/serverless"
import crypto from "crypto"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env" })

function simpleHash(password) {
  return crypto
    .createHash("sha256")
    .update(password + "fitnest-salt-2024")
    .digest("hex")
}

async function createAdmin() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error("DATABASE_URL not found in environment")
    process.exit(1)
  }

  const sql = neon(databaseUrl)

  try {
    const adminEmail = "chihab@ekwip.ma"
    const adminPassword = "FITnest123!"
    const hashedPassword = simpleHash(adminPassword)

    // Check if user exists
    const existing = await sql`
      SELECT id, email, role FROM users WHERE email = ${adminEmail}
    `

    if (existing.length > 0) {
      // Update existing user
      await sql`
        UPDATE users 
        SET name = 'Chihab Admin', password = ${hashedPassword}, role = 'admin'
        WHERE email = ${adminEmail}
      `
      console.log("✅ Admin user updated successfully")
    } else {
      // Create new user
      const result = await sql`
        INSERT INTO users (name, email, password, role)
        VALUES ('Chihab Admin', ${adminEmail}, ${hashedPassword}, 'admin')
        RETURNING id, name, email, role
      `
      console.log("✅ Admin user created successfully")
      console.log("User:", result[0])
    }

    console.log("\n📋 Admin Credentials:")
    console.log("Email:", adminEmail)
    console.log("Password:", adminPassword)
    console.log("\n✅ You can now login at http://localhost:3002/admin")
  } catch (error) {
    console.error("❌ Error creating admin user:", error)
    process.exit(1)
  }
}

createAdmin()


