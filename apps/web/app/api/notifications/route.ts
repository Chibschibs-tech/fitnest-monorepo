export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getSessionUser } from "@/lib/simple-auth"
import { sql, db } from "@/lib/db"

export async function GET() {
  try {
    const cookieStore = cookies()
    const sessionId = cookieStore.get("session-id")?.value

    if (!sessionId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const user = await getSessionUser(sessionId)

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }


    // Get user's notifications
    const userNotifications = await sql`
      SELECT * FROM notifications 
      WHERE user_id = ${user.id} 
      ORDER BY created_at DESC 
      LIMIT 20
    `

    return NextResponse.json(userNotifications)
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const sessionId = cookieStore.get("session-id")?.value

    if (!sessionId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const user = await getSessionUser(sessionId)

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { userId, title, description, type } = await request.json()

    // Validate input
    if (!userId || !title || !description || !type) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }


    // Create notification
    const newNotification = await sql`
      INSERT INTO notifications (user_id, title, description, type)
      VALUES (${userId}, ${title}, ${description}, ${type})
      RETURNING *
    `

    return NextResponse.json(newNotification[0], { status: 201 })
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = cookies()
    const sessionId = cookieStore.get("session-id")?.value

    if (!sessionId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const user = await getSessionUser(sessionId)

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { notificationId, isRead } = await request.json()

    // Validate input
    if (!notificationId) {
      return NextResponse.json({ message: "Missing notification ID" }, { status: 400 })
    }


    // Update notification
    await sql`
      UPDATE notifications 
      SET is_read = ${isRead === undefined ? true : isRead}
      WHERE id = ${notificationId} AND user_id = ${user.id}
    `

    return NextResponse.json({ message: "Notification updated" })
  } catch (error) {
    console.error("Error updating notification:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}
