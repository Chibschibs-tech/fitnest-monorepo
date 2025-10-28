export const dynamic = "force-dynamic";
export const revalidate = 0;

import { type NextRequest, NextResponse } from "next/server"
import { createUser, createSession, initTables } from "@/lib/simple-auth"
import { createCustomerProfile, initCustomersTable } from "@/lib/customer-management"
import { sendWelcomeEmail } from "@/lib/email-utils"

export async function POST(request: NextRequest) {
  try {
    // Initialize both users and customers tables
    await initTables()
    await initCustomersTable()

    const { name, email, password, phone, city, acquisitionSource } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password required" }, { status: 400 })
    }

    // Create user account
    const user = await createUser(name, email, password)

    if (!user) {
      return NextResponse.json({ error: "User already exists or creation failed" }, { status: 409 })
    }

    // Create customer profile
    const customerProfile = await createCustomerProfile(user.id, {
      phone,
      city,
      acquisition_source: acquisitionSource || "website",
    })

    if (!customerProfile) {
      console.warn("Failed to create customer profile for user:", user.id)
    }

    // Create session
    const sessionId = await createSession(user.id)

    if (!sessionId) {
      return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      customer: customerProfile,
    })

    response.cookies.set("session-id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    // Send welcome email (don't block registration if email fails)
    try {
      await sendWelcomeEmail(email, name)
      console.log("Welcome email sent successfully")
    } catch (emailError) {
      console.log("Welcome email failed (non-blocking):", emailError)
    }

    return response
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
