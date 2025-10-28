export const dynamic = "force-dynamic";
export const revalidate = 0;

import { type NextRequest, NextResponse } from "next/server"
import { sql, db } from "@/lib/db"
import { getSessionUser } from "@/lib/simple-auth"


export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("session-id")?.value
    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getSessionUser(sessionId)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get subscription plans with related data - removed p.slug reference
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
      WHERE sp.is_active = true
      GROUP BY sp.id, p.name, p.imageurl
      ORDER BY sp.created_at DESC
    `

    return NextResponse.json({
      success: true,
      plans: plans.map((plan) => ({
        ...plan,
        monthly_revenue: Number.parseFloat(plan.monthly_revenue || 0),
        price: Number.parseFloat(plan.price || 0),
      })),
    })
  } catch (error) {
    console.error("Get subscription plans error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("session-id")?.value
    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getSessionUser(sessionId)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const {
      product_id,
      name,
      description,
      billing_period,
      price,
      trial_period_days,
      delivery_frequency,
      items_per_delivery,
    } = body

    // Validate required fields
    if (!product_id || !name || !price) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: product_id, name, price",
        },
        { status: 400 },
      )
    }

    // Check if plan already exists for this product
    const existingPlan = await sql`
      SELECT id FROM subscription_plans WHERE product_id = ${product_id}
    `

    if (existingPlan.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "A subscription plan already exists for this product",
        },
        { status: 409 },
      )
    }

    // Create the subscription plan
    const result = await sql`
      INSERT INTO subscription_plans (
        product_id, name, description, billing_period, price,
        trial_period_days, delivery_frequency, items_per_delivery, is_active
      ) VALUES (
        ${product_id}, ${name}, ${description || ""}, ${billing_period || "weekly"}, ${price},
        ${trial_period_days || 0}, ${delivery_frequency || "weekly"}, ${items_per_delivery || 1}, true
      ) RETURNING *
    `

    return NextResponse.json({
      success: true,
      plan: {
        ...result[0],
        price: Number.parseFloat(result[0].price),
      },
    })
  } catch (error) {
    console.error("Create subscription plan error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
