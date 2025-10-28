export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { initTables } from "@/lib/simple-auth"

export async function GET() {
  try {
    await initTables()

    return NextResponse.json({
      status: "healthy",
      auth: "session-based",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Auth health check failed:", error)
    return NextResponse.json(
      {
        status: "error",
        error: "Auth system unavailable",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
