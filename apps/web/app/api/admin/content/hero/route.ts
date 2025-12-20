import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSessionUser } from "@/lib/simple-auth"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

// GET - Fetch current hero content
export async function GET() {
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

    const hero = await sql`
      SELECT * FROM content_hero 
      WHERE is_active = true 
      ORDER BY created_at DESC 
      LIMIT 1
    `

    if (hero.length === 0) {
      return NextResponse.json({ data: null })
    }

    return NextResponse.json({ data: hero[0] })
  } catch (error) {
    console.error("Error fetching hero content:", error)
    return NextResponse.json({ error: "Failed to fetch hero content" }, { status: 500 })
  }
}

// POST - Create or update hero content
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
    const {
      desktopImageUrl,
      mobileImageUrl,
      title,
      description,
      altText,
      seoTitle,
      seoDescription,
    } = body

    // Check if there's an existing active hero
    const existing = await sql`
      SELECT id FROM content_hero 
      WHERE is_active = true 
      ORDER BY created_at DESC 
      LIMIT 1
    `

    if (existing.length > 0) {
      // Update existing
      const updated = await sql`
        UPDATE content_hero 
        SET 
          desktop_image_url = ${desktopImageUrl || null},
          mobile_image_url = ${mobileImageUrl || null},
          title = ${title || null},
          description = ${description || null},
          alt_text = ${altText || null},
          seo_title = ${seoTitle || null},
          seo_description = ${seoDescription || null},
          updated_at = NOW()
        WHERE id = ${existing[0].id}
        RETURNING *
      `

      return NextResponse.json({ data: updated[0] })
    } else {
      // Create new
      const created = await sql`
        INSERT INTO content_hero (
          desktop_image_url,
          mobile_image_url,
          title,
          description,
          alt_text,
          seo_title,
          seo_description,
          is_active
        ) VALUES (
          ${desktopImageUrl || null},
          ${mobileImageUrl || null},
          ${title || null},
          ${description || null},
          ${altText || null},
          ${seoTitle || null},
          ${seoDescription || null},
          true
        )
        RETURNING *
      `

      return NextResponse.json({ data: created[0] }, { status: 201 })
    }
  } catch (error) {
    console.error("Error saving hero content:", error)
    return NextResponse.json({ error: "Failed to save hero content" }, { status: 500 })
  }
}

