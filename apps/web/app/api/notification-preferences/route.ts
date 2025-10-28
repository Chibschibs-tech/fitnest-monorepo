export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { db, notificationPreferences } from "@/lib/db"
import { eq } from "drizzle-orm"

export async function GET() {
  try {
    const session = await getServerSession()

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const userId = Number.parseInt(session.user.id as string)

    // Get user's notification preferences
    const preferences = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId))
      .limit(1)

    if (preferences.length === 0) {
      // Create default preferences if none exist
      const defaultPreferences = await db
        .insert(notificationPreferences)
        .values({
          userId,
          emailOrderUpdates: true,
          emailMenuUpdates: true,
          emailPromotions: false,
          smsDeliveryUpdates: true,
          smsReminders: true,
        })
        .returning()

      return NextResponse.json(defaultPreferences[0])
    }

    return NextResponse.json(preferences[0])
  } catch (error) {
    console.error("Error fetching notification preferences:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession()

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const userId = Number.parseInt(session.user.id as string)
    const updates = await request.json()

    // Validate input
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ message: "No updates provided" }, { status: 400 })
    }

    // Check if preferences exist
    const existingPreferences = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId))
      .limit(1)

    if (existingPreferences.length === 0) {
      // Create preferences with updates
      const newPreferences = await db
        .insert(notificationPreferences)
        .values({
          userId,
          emailOrderUpdates: updates.emailOrderUpdates ?? true,
          emailMenuUpdates: updates.emailMenuUpdates ?? true,
          emailPromotions: updates.emailPromotions ?? false,
          smsDeliveryUpdates: updates.smsDeliveryUpdates ?? true,
          smsReminders: updates.smsReminders ?? true,
        })
        .returning()

      return NextResponse.json(newPreferences[0])
    }

    // Update existing preferences
    const updatedPreferences = await db
      .update(notificationPreferences)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(notificationPreferences.userId, userId))
      .returning()

    return NextResponse.json(updatedPreferences[0])
  } catch (error) {
    console.error("Error updating notification preferences:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}
