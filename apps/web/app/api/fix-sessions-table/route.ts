export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"


export async function GET() {
  try {
    console.log("Checking sessions table structure...")

    // First, let's see what columns exist in the sessions table
    let existingColumns = []
    try {
      const columns = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'sessions' AND table_schema = 'public'
      `
      existingColumns = columns.map((col) => col.column_name)
      console.log("Existing sessions table columns:", existingColumns)
    } catch (error) {
      console.log("Sessions table might not exist:", error.message)
    }

    // Drop and recreate the sessions table with correct structure
    console.log("Dropping existing sessions table...")
    await sql`DROP TABLE IF EXISTS sessions CASCADE`

    console.log("Creating new sessions table...")
    await sql`
      CREATE TABLE sessions (
        id VARCHAR(255) PRIMARY KEY,
        user_id INTEGER NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `

    // Verify the new table structure
    const newColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'sessions' AND table_schema = 'public'
      ORDER BY ordinal_position
    `

    console.log("New sessions table created successfully")

    return NextResponse.json({
      status: "success",
      message: "Sessions table fixed successfully",
      oldColumns: existingColumns,
      newColumns: newColumns,
    })
  } catch (error) {
    console.error("Error fixing sessions table:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to fix sessions table",
        error: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
