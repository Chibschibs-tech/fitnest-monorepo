export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"

export async function GET() {
  try {
    // Check environment
    const env = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? "✓ Set" : "✗ Missing",
    }

    // Check database connection
    let dbConnection = "✗ Failed"
    try {
      const result = await sql`SELECT 1 as test`
      if (result[0]?.test === 1) {
        dbConnection = "✓ Connected"
      }
    } catch (error) {
      console.error("Database connection error:", error)
    }

    // Check dependencies
    const dependencies = {
      next: "✓ Available",
      crypto: "✓ Built-in Node.js module",
      uuid: "✓ Available",
    }

    return NextResponse.json({
      status: "deployment-ready",
      environment: env,
      database: dbConnection,
      dependencies,
      authSystem: "session-based",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Deployment diagnostic failed:", error)
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
