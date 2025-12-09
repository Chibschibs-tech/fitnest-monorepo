import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export const dynamic = "force-dynamic"

/**
 * Check database connection status
 * Useful for troubleshooting connection issues
 */
export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL

    // Check if DATABASE_URL is set
    if (!dbUrl) {
      return NextResponse.json({
        connected: false,
        error: "DATABASE_URL environment variable is not set",
        troubleshooting: {
          step1: "Create a .env.local file in apps/web/",
          step2: "Add: DATABASE_URL=postgresql://fitnest:fitnest_dev_password@localhost:5433/fitnest_db",
          step3: "Or use your Neon database URL",
          step4: "Restart the development server",
        },
      })
    }

    // Mask password in URL for security
    const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ":****@")

    // Test connection
    try {
      const result = await sql`SELECT 1 as test, NOW() as current_time`
      
      return NextResponse.json({
        connected: true,
        databaseUrl: maskedUrl,
        test: result[0],
        message: "Database connection successful",
      })
    } catch (connectionError) {
      return NextResponse.json({
        connected: false,
        databaseUrl: maskedUrl,
        error: connectionError instanceof Error ? connectionError.message : String(connectionError),
        troubleshooting: {
          step1: "Verify DATABASE_URL format is correct",
          step2: "Check if database is running: docker-compose ps",
          step3: "Start database: docker-compose up -d",
          step4: "For Neon: Ensure URL includes SSL parameters",
          localFormat: "postgresql://fitnest:fitnest_dev_password@localhost:5433/fitnest_db",
        },
      })
    }
  } catch (error) {
    return NextResponse.json(
      {
        connected: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}


