import { NextResponse } from "next/server"
import { put, list } from "@vercel/blob"
import { cookies } from "next/headers"
import { getSessionUser } from "@/lib/simple-auth"

export const dynamic = "force-dynamic"

// Get current waitlist hero image URL
export async function GET() {
  try {
    // For now, return the current image URL
    // In the future, this could be stored in a database or config
    return NextResponse.json({
      imageUrl: "https://obtmksfewry4ishp.public.blob.vercel-storage.com/hero%20banner"
    })
  } catch (error) {
    console.error("Error fetching waitlist hero image:", error)
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 })
  }
}

// Update waitlist hero image URL
export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const sessionId = cookieStore.get("session-id")?.value

    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getSessionUser(sessionId)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { imageUrl } = body

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 })
    }

    // In the future, you could store this in a database
    // For now, just return success
    return NextResponse.json({ 
      success: true, 
      imageUrl,
      message: "Image URL updated. Please update the waitlist page code with the new URL."
    })
  } catch (error) {
    console.error("Error updating waitlist hero image:", error)
    return NextResponse.json({ error: "Failed to update image" }, { status: 500 })
  }
}


