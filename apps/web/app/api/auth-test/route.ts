export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"

export async function GET() {
  try {

    // Simple test query
    const result = await sql`SELECT 1 as test`

    // Try to get users table info
    const users = await sql`SELECT COUNT(*) FROM users`

    return NextResponse.json({
      status: "success",
      message: "Database connection successful",
      test: result,
      users: users[0],
      env: {
        nextAuthUrl: process.env.NEXTAUTH_URL,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasDbConnection: !!process.env.DATABASE_URL || !!process.env.NEON_DATABASE_URL,
      },
    })
  } catch (error) {
    console.error("Database test failed:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
