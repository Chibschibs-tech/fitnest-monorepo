export const dynamic = "force-dynamic";
export const revalidate = 0;

import { type NextRequest, NextResponse } from "next/server"
import { sql, db } from "@/lib/db"
import { getSessionUser } from "@/lib/simple-auth"


export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const sessionId = request.cookies.get("session-id")?.value
    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getSessionUser(sessionId)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { deliveryIds } = await request.json()

    if (!deliveryIds || !Array.isArray(deliveryIds)) {
      return NextResponse.json({ error: "Missing or invalid deliveryIds" }, { status: 400 })
    }

    // Update delivery status to delivered
    for (const deliveryId of deliveryIds) {
      await sql`
        UPDATE deliveries 
        SET status = 'delivered'
        WHERE id = ${deliveryId}
      `
    }

    return NextResponse.json({
      success: true,
      message: `${deliveryIds.length} deliveries marked as delivered`,
    })
  } catch (error) {
    console.error("Error marking deliveries as delivered:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update deliveries",
      },
      { status: 500 },
    )
  }
}
