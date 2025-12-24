import { put } from "@vercel/blob"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getSessionUser } from "@/lib/simple-auth"

// New way to set config for route handlers in Next.js App Router
export const maxDuration = 60 // 60 seconds timeout
export const dynamic = "force-dynamic"

export async function POST(request: Request): Promise<NextResponse> {
  // Check authentication using current auth system
  const cookieStore = cookies()
  const sessionId = cookieStore.get("session-id")?.value

  if (!sessionId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await getSessionUser(sessionId)
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get("filename")

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Generate a unique filename with timestamp
    const uniqueFilename = filename ? `${Date.now()}-${filename}` : `${Date.now()}-${file.name}`

    // Upload to Vercel Blob
    const blob = await put(uniqueFilename, file, {
      access: "public",
    })

    return NextResponse.json(blob)
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
