import { type NextRequest, NextResponse } from "next/server"
import { deleteSession } from "@/lib/auth"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("session-id")?.value

    if (sessionId) {
      await deleteSession(sessionId)
    }

    const response = NextResponse.json({ success: true })
    response.cookies.delete("session-id")

    return response
  } catch (error) {
    console.error("[LOGOUT] Logout error:", error)
    const response = NextResponse.json({ success: true }) // Always return success
    response.cookies.delete("session-id")
    return response
  }
}
