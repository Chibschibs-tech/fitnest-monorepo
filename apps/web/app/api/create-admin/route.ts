export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"
import crypto from "crypto"


// Simple hash function using built-in crypto only
function simpleHash(password: string): string {
  return crypto
    .createHash("sha256")
    .update(password + "fitnest-salt-2024")
    .digest("hex")
}

export async function GET() {
  try {
    // First, let's check what admin users exist
    const existingAdmins = await sql`
      SELECT id, name, email, role, created_at 
      FROM users 
      WHERE role = 'admin' OR email LIKE '%admin%' OR email = 'chihab@ekwip.ma'
    `

    console.log("Existing admin users:", existingAdmins)

    // Create/update the admin user with known credentials
    const adminEmail = "chihab@ekwip.ma"
    const adminPassword = "FITnest123!"
    const hashedPassword = simpleHash(adminPassword)

    // Delete existing admin if exists and recreate
    await sql`DELETE FROM users WHERE email = ${adminEmail}`

    // Create new admin user
    const result = await sql`
      INSERT INTO users (name, email, password, role)
      VALUES ('Chihab Admin', ${adminEmail}, ${hashedPassword}, 'admin')
      RETURNING id, name, email, role
    `

    const newAdmin = result[0]

    return NextResponse.json({
      status: "success",
      message: "Admin user created/updated successfully",
      admin: newAdmin,
      credentials: {
        email: adminEmail,
        password: adminPassword,
        note: "Use these exact credentials to log in",
      },
      existingAdmins: existingAdmins,
    })
  } catch (error) {
    console.error("Error creating admin:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to create admin user",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
