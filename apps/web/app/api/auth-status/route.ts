import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/simple-auth"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const cookieStore = cookies()
    const sessionId = cookieStore.get("session-id")?.value

    if (!sessionId) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      })
    }

    const user = await getSessionUser(sessionId)

    return NextResponse.json({
      authenticated: !!user,
      user: user || null,
    })
  } catch (error) {
    console.error("Auth status check failed:", error)
    return NextResponse.json({
      authenticated: false,
      user: null,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
