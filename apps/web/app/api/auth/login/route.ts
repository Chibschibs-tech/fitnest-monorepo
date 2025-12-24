import { type NextRequest, NextResponse } from "next/server"
import { initAuthTables, ensureAdminUser, authenticateUser, createSession } from "@/lib/auth"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    // Initialize tables and ensure admin exists
    await initAuthTables()
    await ensureAdminUser()

    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Authenticate user
    const user = await authenticateUser(email, password)

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    // Create session
    const sessionId = await createSession(user.id)

    if (!sessionId) {
      return NextResponse.json(
        { error: "Failed to create session" },
        { status: 500 }
      )
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })

    // Set session cookie
    const isProduction = process.env.NODE_ENV === "production"
    response.cookies.set("session-id", sessionId, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    console.log("[LOGIN] Login successful:", { email: user.email, role: user.role })
    return response
  } catch (error) {
    console.error("[LOGIN] Login error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
