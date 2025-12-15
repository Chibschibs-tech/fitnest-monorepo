export const dynamic = "force-dynamic";
export const revalidate = 0;

import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSessionUser } from "@/lib/simple-auth"


export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user is authenticated and is admin
    const sessionId = request.cookies.get("session-id")?.value
    if (!sessionId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const user = await getSessionUser(sessionId)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    const { status } = await request.json()
    const subscriptionId = Number.parseInt(params.id)

    if (isNaN(subscriptionId)) {
      return NextResponse.json({ success: false, error: "Invalid subscription ID" }, { status: 400 })
    }

    // Validate status
    const validStatuses = ['active', 'paused', 'canceled', 'expired']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ 
        success: false, 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      }, { status: 400 })
    }

    // Update subscription status directly in subscriptions table
    await sql`
      UPDATE subscriptions 
      SET status = ${status}
      WHERE id = ${subscriptionId}
    `

    return NextResponse.json({
      success: true,
      message: "Subscription status updated successfully",
    })
  } catch (error) {
    console.error("Error updating subscription status:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update subscription status",
      },
      { status: 500 },
    )
  }
}
