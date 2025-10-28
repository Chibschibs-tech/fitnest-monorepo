export const dynamic = "force-dynamic";
export const revalidate = 0;

import { type NextRequest, NextResponse } from "next/server"
import { sql, db } from "@/lib/db"
import { getSessionUser } from "@/lib/simple-auth"


export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionId = request.cookies.get("session-id")?.value
    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getSessionUser(sessionId)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const planId = Number.parseInt(params.id)
    if (isNaN(planId)) {
      return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 })
    }

    // Get specific subscription plan
    const plans = await sql`
      SELECT 
        sp.*,
        p.name as product_name,
        p.imageurl as featured_image,
        COUNT(DISTINCT spi.id) as item_count,
        COUNT(DISTINCT asub.id) as subscriber_count,
        COALESCE(SUM(asub.billing_amount), 0) as monthly_revenue
      FROM subscription_plans sp
      LEFT JOIN products p ON sp.product_id = p.id
      LEFT JOIN subscription_plan_items spi ON sp.id = spi.plan_id
      LEFT JOIN active_subscriptions asub ON sp.id = asub.plan_id AND asub.status = 'active'
      WHERE sp.id = ${planId}
      GROUP BY sp.id, p.name, p.imageurl
    `

    if (plans.length === 0) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      plan: {
        ...plans[0],
        monthly_revenue: Number.parseFloat(plans[0].monthly_revenue || 0),
        price: Number.parseFloat(plans[0].price || 0),
      },
    })
  } catch (error) {
    console.error("Get subscription plan error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionId = request.cookies.get("session-id")?.value
    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getSessionUser(sessionId)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const planId = Number.parseInt(params.id)
    if (isNaN(planId)) {
      return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 })
    }

    const body = await request.json()
    const {
      name,
      description,
      billing_period,
      price,
      trial_period_days,
      delivery_frequency,
      items_per_delivery,
      is_active,
    } = body

    // Update the subscription plan
    const result = await sql`
      UPDATE subscription_plans SET
        name = ${name},
        description = ${description || ""},
        billing_period = ${billing_period || "weekly"},
        price = ${price},
        trial_period_days = ${trial_period_days || 0},
        delivery_frequency = ${delivery_frequency || "weekly"},
        items_per_delivery = ${items_per_delivery || 1},
        is_active = ${is_active !== undefined ? is_active : true},
        updated_at = NOW()
      WHERE id = ${planId}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      plan: {
        ...result[0],
        price: Number.parseFloat(result[0].price),
      },
    })
  } catch (error) {
    console.error("Update subscription plan error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionId = request.cookies.get("session-id")?.value
    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getSessionUser(sessionId)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const planId = Number.parseInt(params.id)
    if (isNaN(planId)) {
      return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 })
    }

    // Check if plan has active subscriptions
    const activeSubscriptions = await sql`
      SELECT COUNT(*) as count FROM active_subscriptions 
      WHERE plan_id = ${planId} AND status = 'active'
    `

    if (Number.parseInt(activeSubscriptions[0].count) > 0) {
      return NextResponse.json({ error: "Cannot delete plan with active subscriptions" }, { status: 400 })
    }

    // Delete plan items first
    await sql`DELETE FROM subscription_plan_items WHERE plan_id = ${planId}`

    // Delete the plan
    const result = await sql`DELETE FROM subscription_plans WHERE id = ${planId} RETURNING *`

    if (result.length === 0) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Plan deleted successfully",
    })
  } catch (error) {
    console.error("Delete subscription plan error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
