import { type NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/simple-auth"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("session-id")?.value

    if (!sessionId) {
      return NextResponse.json({ user: null })
    }

    const user = await getSessionUser(sessionId)

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Session check error:", error)
    return NextResponse.json({ user: null })
  }
}
