export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { sql, db } from "@/lib/db"

export async function GET() {
  try {
    // Check critical environment variables
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    }

    // Test database connection
    let dbStatus = "unknown"
    try {
      await sql`SELECT 1`
      dbStatus = "connected"
    } catch (dbError) {
      dbStatus = `error: ${dbError instanceof Error ? dbError.message : "unknown"}`
    }

    // Check for common deployment issues
    const checks = {
      environment: envCheck,
      database: dbStatus,
      nodeVersion: process.version,
      nextVersion: "14.2.25", // from your package.json
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json({
      status: "deployment-check-complete",
      checks,
      allGood: envCheck.DATABASE_URL && envCheck.NEXTAUTH_URL && envCheck.NEXTAUTH_SECRET && dbStatus === "connected",
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "deployment-check-failed",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
