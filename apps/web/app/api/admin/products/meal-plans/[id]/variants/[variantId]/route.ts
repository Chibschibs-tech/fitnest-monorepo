export const dynamic = "force-dynamic"
export const revalidate = 0

import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSessionUser } from "@/lib/simple-auth"
import { createErrorResponse, Errors } from "@/lib/error-handler"

// Helper to check admin auth
async function checkAdminAuth(request: NextRequest) {
  const sessionId = request.cookies.get("session-id")?.value
  if (!sessionId) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), user: null }
  }

  const user = await getSessionUser(sessionId)
  if (!user || user.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), user: null }
  }

  return { error: null, user }
}

// PUT: Update a plan variant
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; variantId: string } }
) {
  try {
    const authCheck = await checkAdminAuth(request)
    if (authCheck.error) return authCheck.error

    const variantId = Number.parseInt(params.variantId)
    if (isNaN(variantId)) {
      return createErrorResponse(Errors.validation("Invalid variant ID"), "Invalid variant ID", 400)
    }

    const body = await request.json()
    const { label, days_per_week, meals_per_day, weekly_price_mad, published } = body

    // Check if variant exists
    const existing = await sql`SELECT id FROM plan_variants WHERE id = ${variantId}`
    if (existing.length === 0) {
      return createErrorResponse(Errors.notFound("Plan variant not found"), "Plan variant not found", 404)
    }

    // Build update query dynamically
    const updateFields: string[] = []
    const values: any[] = []
    let paramCounter = 1

    if (label !== undefined) {
      updateFields.push(`label = $${paramCounter++}`)
      values.push(label)
    }
    if (days_per_week !== undefined) {
      if (days_per_week < 1 || days_per_week > 7) {
        return createErrorResponse(
          Errors.validation("Invalid days_per_week"),
          "days_per_week must be between 1 and 7",
          400
        )
      }
      updateFields.push(`days_per_week = $${paramCounter++}`)
      values.push(days_per_week)
    }
    if (meals_per_day !== undefined) {
      if (meals_per_day < 1 || meals_per_day > 5) {
        return createErrorResponse(
          Errors.validation("Invalid meals_per_day"),
          "meals_per_day must be between 1 and 5",
          400
        )
      }
      updateFields.push(`meals_per_day = $${paramCounter++}`)
      values.push(meals_per_day)
    }
    if (weekly_price_mad !== undefined) {
      if (weekly_price_mad < 0) {
        return createErrorResponse(
          Errors.validation("Invalid price"),
          "weekly_price_mad must be positive",
          400
        )
      }
      updateFields.push(`weekly_price_mad = $${paramCounter++}`)
      values.push(weekly_price_mad)
    }
    if (published !== undefined) {
      updateFields.push(`published = $${paramCounter++}`)
      values.push(published)
    }

    if (updateFields.length === 0) {
      return createErrorResponse(Errors.validation("No fields to update"), "No fields to update", 400)
    }

    values.push(variantId)

    // Use q() helper for parameterized queries
    const { q } = await import("@/lib/db")
    const result = await q(
      `UPDATE plan_variants SET ${updateFields.join(', ')} WHERE id = $${paramCounter} RETURNING id, meal_plan_id, label, days_per_week, meals_per_day, weekly_price_mad, published`,
      values
    )

    return NextResponse.json({
      success: true,
      variant: {
        id: result[0].id,
        meal_plan_id: result[0].meal_plan_id,
        label: result[0].label,
        days_per_week: result[0].days_per_week,
        meals_per_day: result[0].meals_per_day,
        weekly_price_mad: Number(result[0].weekly_price_mad || 0),
        published: result[0].published,
      },
    })
  } catch (error) {
    return createErrorResponse(error, "Failed to update plan variant", 500)
  }
}

// DELETE: Delete a plan variant
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; variantId: string } }
) {
  try {
    const authCheck = await checkAdminAuth(request)
    if (authCheck.error) return authCheck.error

    const variantId = Number.parseInt(params.variantId)
    if (isNaN(variantId)) {
      return createErrorResponse(Errors.validation("Invalid variant ID"), "Invalid variant ID", 400)
    }

    // Check if variant exists
    const existing = await sql`SELECT id FROM plan_variants WHERE id = ${variantId}`
    if (existing.length === 0) {
      return createErrorResponse(Errors.notFound("Plan variant not found"), "Plan variant not found", 404)
    }

    // Check if there are active subscriptions using this variant
    const activeSubscriptions = await sql`
      SELECT COUNT(*) as count
      FROM subscriptions
      WHERE plan_variant_id = ${variantId} AND status = 'active'
    `

    if (Number(activeSubscriptions[0]?.count || 0) > 0) {
      // Soft delete: just unpublish instead of deleting
      await sql`
        UPDATE plan_variants
        SET published = false
        WHERE id = ${variantId}
      `
      return NextResponse.json({
        success: true,
        message: "Plan variant unpublished (has active subscriptions)",
      })
    }

    // Hard delete if no active subscriptions
    await sql`DELETE FROM plan_variants WHERE id = ${variantId}`

    return NextResponse.json({
      success: true,
      message: "Plan variant deleted successfully",
    })
  } catch (error) {
    return createErrorResponse(error, "Failed to delete plan variant", 500)
  }
}





