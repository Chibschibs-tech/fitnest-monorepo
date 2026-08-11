import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import {
  computeSubscriptionPriceByPlanTitle,
  PricingError,
} from "@/lib/subscription-pricing"

export const dynamic = "force-dynamic"
export const revalidate = 0

/**
 * POST /api/subscriptions/create
 * Create a subscription from cart item after checkout.
 *
 * The price is recomputed server-side by the single pricing function and
 * FROZEN on the subscription row (price_per_day_mad, discount_percentage,
 * total_mad): a later tariff change never alters a sold subscription.
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

    // Server-side price, frozen at signup
    let price
    try {
      price = await computeSubscriptionPriceByPlanTitle(plan_name, {
        mealTypes: meal_types,
        daysPerWeek: days_per_week,
        durationWeeks: duration_weeks,
      })
    } catch (err) {
      if (err instanceof PricingError) {
        return NextResponse.json({ error: err.message }, { status: err.status })
      }
      throw err
    }

    // Calculate subscription start date (today)
    const startsAt = new Date()

    // Calculate renewal date based on duration
    const renewsAt = new Date(startsAt)
    renewsAt.setDate(renewsAt.getDate() + (duration_weeks * 7))

    const subscription = await sql`
      INSERT INTO subscriptions (
        user_id,
        meal_plan_id,
        meal_types,
        days_per_week,
        duration_weeks,
        price_per_day_mad,
        discount_percentage,
        total_mad,
        status,
        starts_at,
        renews_at,
        notes
      )
      VALUES (
        ${user_id},
        ${price.mealPlanId},
        ${meal_types}::text[],
        ${days_per_week},
        ${duration_weeks},
        ${price.pricePerDay},
        ${price.discountPercentage},
        ${price.total},
        'active', -- Use 'active' for now, track 'new' in notes until schema updated
        ${startsAt.toISOString()},
        ${renewsAt.toISOString()},
        ${JSON.stringify({
          subscription_status: 'new', // Track actual status in notes
          payment_status: 'pending',
          shipping_address,
          delivery_address,
          payment_method,
          created_at: new Date().toISOString(),
        })}
      )
      RETURNING id, user_id, meal_plan_id, status, starts_at, renews_at, total_mad
    `

    const subscriptionId = subscription[0].id

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscriptionId,
        user_id: subscription[0].user_id,
        meal_plan_id: subscription[0].meal_plan_id,
        status: subscription[0].status, // "active" (but subscription_status: "new" in notes)
        subscription_status: 'new', // Actual status
        payment_status: 'pending',
        starts_at: subscription[0].starts_at,
        renews_at: subscription[0].renews_at,
        total_mad: Number(subscription[0].total_mad),
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
