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
        error: "No session-id cookie found",
        cookies: Object.fromEntries(cookieStore.getAll().map((cookie) => [cookie.name, cookie.value])),
      })
    }

    console.log("Debug: Session ID found:", sessionId)

    // Use the existing session system with the correct parameter
    const user = await getSessionUser(sessionId)

    console.log("Debug: User from session:", user)

    return NextResponse.json({
      authenticated: !!user,
      user: user || null,
      sessionId: sessionId.substring(0, 20) + "...",
      cookies: Object.fromEntries(cookieStore.getAll().map((cookie) => [cookie.name, cookie.value])),
      debug: {
        sessionIdLength: sessionId.length,
        sessionIdFull: sessionId, // Temporary for debugging
      },
    })
  } catch (error) {
    console.error("Debug auth error:", error)
    return NextResponse.json({
      authenticated: false,
      error: error.message,
      stack: error.stack,
      sessionId: cookieStore?.get("session-id")?.value?.substring(0, 20) + "..." || "none",
    })
  }
}
