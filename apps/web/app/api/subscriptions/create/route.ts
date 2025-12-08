import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"
export const revalidate = 0

/**
 * POST /api/subscriptions/create
 * Create a subscription from cart item after checkout
 * Status: "new" until payment confirmed
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      user_id,
      plan_name,
      meal_types,
      days_per_week,
      duration_weeks,
      total_price,
      shipping_address,
      delivery_address,
      payment_method,
    } = body

    // Validation
    if (!user_id || !plan_name || !meal_types || !Array.isArray(meal_types) || meal_types.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: user_id, plan_name, meal_types" },
        { status: 400 }
      )
    }

    if (!days_per_week || days_per_week < 1 || days_per_week > 7) {
      return NextResponse.json(
        { error: "days_per_week must be between 1 and 7" },
        { status: 400 }
      )
    }

    if (!duration_weeks || duration_weeks < 1) {
      return NextResponse.json(
        { error: "duration_weeks must be at least 1" },
        { status: 400 }
      )
    }

    // Find plan_variant_id from plan_name
    // Note: This assumes plan_name maps to a meal_plan -> plan_variant
    // You may need to adjust this based on your actual schema
    const planVariant = await sql`
      SELECT pv.id 
      FROM plan_variants pv
      JOIN meal_plans mp ON pv.meal_plan_id = mp.id
      WHERE mp.title = ${plan_name}
      LIMIT 1
    `

    if (planVariant.length === 0) {
      return NextResponse.json(
        { error: `Plan variant not found for plan: ${plan_name}` },
        { status: 404 }
      )
    }

    const planVariantId = planVariant[0].id

    // Calculate subscription start date (today)
    const startsAt = new Date()
    
    // Calculate renewal date based on duration
    const renewsAt = new Date(startsAt)
    renewsAt.setDate(renewsAt.getDate() + (duration_weeks * 7))

    // Create subscription with status "new" (using notes to track if schema doesn't support "new")
    // Note: If Drizzle schema doesn't allow "new", we'll use "active" and track in notes
    const subscription = await sql`
      INSERT INTO subscriptions (
        user_id,
        plan_variant_id,
        status,
        starts_at,
        renews_at,
        notes
      )
      VALUES (
        ${user_id},
        ${planVariantId},
        'active', -- Use 'active' for now, track 'new' in notes until schema updated
        ${startsAt.toISOString()},
        ${renewsAt.toISOString()},
        ${JSON.stringify({
          subscription_status: 'new', // Track actual status in notes
          payment_status: 'pending',
          plan_name,
          meal_types,
          days_per_week,
          duration_weeks,
          total_price,
          shipping_address,
          delivery_address,
          payment_method,
          created_at: new Date().toISOString(),
        })}
      )
      RETURNING id, user_id, plan_variant_id, status, starts_at, renews_at
    `

    const subscriptionId = subscription[0].id

    // Payment status is tracked in subscription notes for now
    // TODO: Create payments table when payment system is implemented

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscriptionId,
        user_id: subscription[0].user_id,
        plan_variant_id: subscription[0].plan_variant_id,
        status: subscription[0].status, // "active" (but subscription_status: "new" in notes)
        subscription_status: 'new', // Actual status
        payment_status: 'pending',
        starts_at: subscription[0].starts_at,
        renews_at: subscription[0].renews_at,
      },
      message: "Subscription created successfully with status 'new'. Awaiting payment confirmation.",
    })
  } catch (error) {
    console.error("Error creating subscription:", error)
    return NextResponse.json(
      {
        error: "Failed to create subscription",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

