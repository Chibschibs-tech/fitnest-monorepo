export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getSessionUser } from "@/lib/simple-auth"

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

    // Mock meal preferences for now
    const preferences = {
      dietaryRestrictions: [],
      allergies: [],
      preferredCuisines: [],
      mealsPerWeek: 12,
      portionSize: "regular",
    }

    return NextResponse.json(preferences)
  } catch (error) {
    console.error("Error fetching meal preferences:", error)
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

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const preferences = await request.json()

    // Here you would save to database
    // For now, just return success
    return NextResponse.json({ message: "Preferences updated successfully" })
  } catch (error) {
    console.error("Error updating meal preferences:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}
