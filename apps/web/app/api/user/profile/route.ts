import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getSessionUser } from "@/lib/simple-auth"
import { sql } from "@/lib/db"
import { hashPassword, verifyPassword } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const cookieStore = cookies()
    const sessionId = cookieStore.get("session-id")?.value

    if (!sessionId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const user = await getSessionUser(sessionId)
    if (!user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const rows = await sql`
      SELECT id, name, email, phone, city
      FROM users
      WHERE id = ${user.id}
    `

    if (rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, user: rows[0] })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = cookies()
    const sessionId = cookieStore.get("session-id")?.value

    if (!sessionId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const user = await getSessionUser(sessionId)
    if (!user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const body = await request.json()
    const { name, phone, city, currentPassword, newPassword } = body

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password is required" }, { status: 400 })
      }

      const rows = await sql`SELECT password FROM users WHERE id = ${user.id}`
      if (rows.length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      const valid = await verifyPassword(currentPassword, rows[0].password)
      if (!valid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 })
      }

      const hashed = await hashPassword(newPassword)
      await sql`UPDATE users SET password = ${hashed}, updated_at = NOW() WHERE id = ${user.id}`
    }

    if (name !== undefined || phone !== undefined || city !== undefined) {
      const updateName = name?.trim() || null
      const updatePhone = phone?.trim() || null
      const updateCity = city?.trim() || null

      await sql`
        UPDATE users
        SET
          name = COALESCE(${updateName}, name),
          phone = COALESCE(${updatePhone}, phone),
          city = COALESCE(${updateCity}, city),
          updated_at = NOW()
        WHERE id = ${user.id}
      `
    }

    const updated = await sql`
      SELECT id, name, email, phone, city
      FROM users
      WHERE id = ${user.id}
    `

    return NextResponse.json({ success: true, user: updated[0] })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
