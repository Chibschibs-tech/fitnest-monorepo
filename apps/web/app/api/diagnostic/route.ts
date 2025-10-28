export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"

export async function GET() {
  try {
    // Test database connection

    // Simple query that should always work
    const result = await sql`SELECT 1 as test`

    return NextResponse.json({
      status: "ok",
      databaseConnected: true,
      result: result,
      databaseUrl: process.env.DATABASE_URL ? "Set (masked)" : "Not set",
      environment: process.env.NODE_ENV,
    })
  } catch (error) {
    console.error("Diagnostic error:", error)

    return NextResponse.json(
      {
        status: "error",
        databaseConnected: false,
        error: error instanceof Error ? error.message : String(error),
        databaseUrl: process.env.DATABASE_URL ? "Set (masked)" : "Not set",
        environment: process.env.NODE_ENV,
      },
      { status: 500 },
    )
  }
}
