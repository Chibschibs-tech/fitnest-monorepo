import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    deployment: {
      status: "unknown",
      version: process.env.VERCEL_GIT_COMMIT_SHA || "local",
      branch: process.env.VERCEL_GIT_COMMIT_REF || "local",
      url: process.env.VERCEL_URL || "localhost",
    },
    database: {
      connected: false,
      error: null as string | null,
    },
    api: {
      endpoints: [] as Array<{ name: string; status: string; error?: string }>,
    },
    environmentVariables: {
      database: !!process.env.DATABASE_URL,
      email: {
        host: !!process.env.EMAIL_SERVER_HOST,
        port: !!process.env.EMAIL_SERVER_PORT,
        user: !!process.env.EMAIL_SERVER_USER,
        password: !!process.env.EMAIL_SERVER_PASSWORD,
        from: !!process.env.EMAIL_FROM,
      },
      blob: !!process.env.BLOB_READ_WRITE_TOKEN,
    },
  }

  // Check database connection
  try {
    const result = await sql`SELECT 1 as test`
    checks.database.connected = result.length > 0
  } catch (error) {
    checks.database.connected = false
    checks.database.error = error instanceof Error ? error.message : String(error)
  }

  // Check key API endpoints
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

  const endpointsToCheck = [
    { name: "Health Check", path: "/api/health-check" },
    { name: "DB Diagnostic", path: "/api/db-diagnostic" },
    { name: "Email Diagnostic", path: "/api/email-diagnostic" },
  ]

  for (const endpoint of endpointsToCheck) {
    try {
      const response = await fetch(`${baseUrl}${endpoint.path}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        // Add a timeout
        signal: AbortSignal.timeout(5000),
      })
      checks.api.endpoints.push({
        name: endpoint.name,
        status: response.ok ? "ok" : `error_${response.status}`,
      })
    } catch (error) {
      checks.api.endpoints.push({
        name: endpoint.name,
        status: "error",
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  // Determine overall deployment status
  const allChecksPass =
    checks.database.connected &&
    checks.api.endpoints.every((e) => e.status === "ok") &&
    checks.environmentVariables.database

  checks.deployment.status = allChecksPass ? "healthy" : "degraded"

  return NextResponse.json(checks, {
    status: allChecksPass ? 200 : 503,
  })
}

