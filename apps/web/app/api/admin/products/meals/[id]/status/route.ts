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

    const mealId = Number.parseInt(params.id)
    const body = await request.json()
    const { is_available } = body

    if (typeof is_available !== "boolean") {
      return NextResponse.json({ message: "is_available must be a boolean" }, { status: 400 })
    }

    const result = await sql`
      UPDATE meals 
      SET is_available = ${is_available}
      WHERE id = ${mealId}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ message: "Meal not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      meal: result[0],
      message: `Meal ${is_available ? "enabled" : "disabled"} successfully`,
    })
  } catch (error) {
    console.error("Error updating meal status:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update meal status",
      },
      { status: 500 },
    )
  }
}
