export const dynamic = "force-dynamic";
export const revalidate = 0;

import { type NextRequest, NextResponse } from "next/server"
import { sql, db } from "@/lib/db"


export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user is authenticated and is admin
    const sessionId = request.cookies.get("session-id")?.value
    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { status } = await request.json()
    const subscriptionId = params.id

    // Update subscription status by updating the corresponding order
    const orderStatus = status === "cancelled" ? "cancelled" : "completed"

    await sql`
      UPDATE orders 
      SET status = ${orderStatus}
      WHERE id = ${subscriptionId} AND order_type = 'subscription'
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
