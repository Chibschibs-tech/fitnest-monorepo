export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"

export async function GET() {
  try {
    // Initialize the Neon SQL client directly

    // Simple query to test connection
    const result = await sql`SELECT 1 as test`

    return NextResponse.json({
      success: true,
      result: result[0],
      databaseUrl: process.env.DATABASE_URL ? "Database URL is set" : "Database URL is missing",
    })
  } catch (error) {
    console.error("Database test failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
