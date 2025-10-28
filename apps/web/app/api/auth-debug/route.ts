import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { cookies } from "next/headers"
import { getSession } from "@/lib/jwt"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Get session using NextAuth
    const nextAuthSession = await getServerSession(authOptions)

    // Get session using our custom JWT method
    const jwtSession = await getSession()

    // Get all cookies for debugging
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll()
    const cookieNames = allCookies.map((cookie) => cookie.name)

    // Check for specific auth cookies
    const hasNextAuthSession = cookieStore.has("next-auth.session-token")
    const hasJWT = cookieStore.has("jwt")

    return NextResponse.json({
      status: "success",
      nextAuth: {
        session: nextAuthSession,
        isAuthenticated: !!nextAuthSession?.user,
      },
      jwt: {
        session: jwtSession,
        isAuthenticated: !!jwtSession,
      },
      cookies: {
        names: cookieNames,
        hasNextAuthSession,
        hasJWT,
      },
    })
  } catch (error) {
    console.error("Auth debug error:", error)
    return NextResponse.json({
      status: "error",
      message: "Failed to debug authentication",
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
