import { type NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("session-id")?.value
    const user = await getSessionUser(sessionId)

    return NextResponse.json({ user })
  } catch (error) {
    console.error("[SESSION] Session check error:", error)
    return NextResponse.json({ user: null })
  }
}
