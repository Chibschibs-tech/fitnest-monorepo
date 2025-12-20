import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSessionUser } from "@/lib/simple-auth"
import { cookies } from "next/headers"
import { createErrorResponse, Errors } from "@/lib/error-handler"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function POST(request: NextRequest) {
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
    const { action, ids } = body

    if (!action || !Array.isArray(ids) || ids.length === 0) {
      return createErrorResponse(
        Errors.validation("Invalid request"),
        "action and ids array are required",
        400
      )
    }

    const productIds = ids.map((id) => Number.parseInt(String(id))).filter((id) => !isNaN(id))

    if (productIds.length === 0) {
      return createErrorResponse(
        Errors.validation("Invalid IDs"),
        "No valid product IDs provided",
        400
      )
    }

    let result
    let message = ""

    switch (action) {
      case "activate":
        result = await sql`
          UPDATE products 
          SET isactive = true 
          WHERE id = ANY(${productIds}::int[])
            AND category IN ('protein_bars', 'supplements', 'healthy_snacks', 'beverages')
          RETURNING id
        `
        message = `Activated ${result.length} product(s)`
        break

      case "deactivate":
        result = await sql`
          UPDATE products 
          SET isactive = false 
          WHERE id = ANY(${productIds}::int[])
            AND category IN ('protein_bars', 'supplements', 'healthy_snacks', 'beverages')
          RETURNING id
        `
        message = `Deactivated ${result.length} product(s)`
        break

      case "delete":
        // Soft delete
        result = await sql`
          UPDATE products 
          SET isactive = false 
          WHERE id = ANY(${productIds}::int[])
            AND category IN ('protein_bars', 'supplements', 'healthy_snacks', 'beverages')
          RETURNING id
        `
        message = `Deleted (unpublished) ${result.length} product(s)`
        break

      default:
        return createErrorResponse(
          Errors.validation("Invalid action"),
          "Action must be 'activate', 'deactivate', or 'delete'",
          400
        )
    }

    return NextResponse.json({
      success: true,
      message,
      affected: result.length,
    })
  } catch (error) {
    console.error("Error in bulk operation:", error)
    return createErrorResponse(error, "Failed to perform bulk operation", 500)
  }
}



