import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getSessionUser } from "@/lib/simple-auth"
import { sql } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
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

    const deliveryId = Number.parseInt(params.id)
    const body = await request.json()
    const { status } = body

    if (!["pending", "in_transit", "delivered", "failed"].includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 })
    }

    // Map delivery status to order status
    let orderStatus = status
    if (status === "pending") orderStatus = "active"
    if (status === "in_transit") orderStatus = "processing"
    if (status === "delivered") orderStatus = "delivered"
    if (status === "failed") orderStatus = "cancelled"

    const result = await sql`
      UPDATE orders 
      SET status = ${orderStatus}
      WHERE id = ${deliveryId}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ message: "Delivery not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      delivery: result[0],
      message: `Delivery status updated to ${status}`,
    })
  } catch (error) {
    console.error("Error updating delivery status:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update delivery status",
      },
      { status: 500 },
    )
  }
}
