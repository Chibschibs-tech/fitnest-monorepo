export const dynamic = "force-dynamic"
export const revalidate = 0

import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSessionUser } from "@/lib/simple-auth"
import { Errors } from "@/lib/error-handler"
import {
  computeSubscriptionPrice,
  PricingError,
} from "@/lib/subscription-pricing"

// Helper to check admin auth
async function checkAdminAuth(request: NextRequest) {
  const sessionId = request.cookies.get("session-id")?.value
  if (!sessionId) {
    return { error: Errors.unauthorized(), user: null }
  }

  const user = await getSessionUser(sessionId)
  if (!user || user.role !== "admin") {
    return { error: Errors.forbidden(), user: null }
  }

  return { error: null, user }
}

const round2 = (n: number) => Math.round(n * 100) / 100

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authCheck = await checkAdminAuth(request)
    if (authCheck.error) {
      return NextResponse.json({ 
        success: false, 
        error: authCheck.error.message || "Unauthorized" 
      }, { status: authCheck.error.statusCode || 401 })
    }

    const customerId = Number.parseInt(params.id)
    if (isNaN(customerId)) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid customer ID. Customer ID must be a number." 
      }, { status: 400 })
    }

    // Check if customer exists
    const customer = await sql`SELECT id, name, email FROM users WHERE id = ${customerId}`
    if (customer.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Customer not found" 
      }, { status: 404 })
    }

    const body = await request.json()

    // Validate required fields
    const mealPlanId = Number.parseInt(body.meal_plan_id)
    if (!mealPlanId || isNaN(mealPlanId)) {
      return NextResponse.json({ 
        success: false, 
        error: "meal_plan_id is required" 
      }, { status: 400 })
    }

    if (!body.meal_types || !Array.isArray(body.meal_types) || body.meal_types.length < 2) {
      return NextResponse.json({ 
        success: false, 
        error: "At least 2 meal types are required" 
      }, { status: 400 })
    }

    if (!body.days_per_week || body.days_per_week < 1 || body.days_per_week > 7) {
      return NextResponse.json({ 
        success: false, 
        error: "days_per_week must be between 1 and 7" 
      }, { status: 400 })
    }

    if (!body.duration_weeks || body.duration_weeks < 1) {
      return NextResponse.json({ 
        success: false, 
        error: "duration_weeks must be at least 1" 
      }, { status: 400 })
    }

    if (!body.payment_method) {
      return NextResponse.json({ 
        success: false, 
        error: "payment_method is required" 
      }, { status: 400 })
    }

    // Validate payment method
    const validPaymentMethods = ['cash_on_delivery', 'bank_transfer', 'credit_card']
    if (!validPaymentMethods.includes(body.payment_method)) {
      return NextResponse.json({ 
        success: false, 
        error: `payment_method must be one of: ${validPaymentMethods.join(', ')}` 
      }, { status: 400 })
    }

    // Price computed by the single pricing function
    let price
    try {
      price = await computeSubscriptionPrice({
        mealPlanId,
        mealTypes: body.meal_types,
        daysPerWeek: body.days_per_week,
        durationWeeks: body.duration_weeks,
      })
    } catch (priceError) {
      if (priceError instanceof PricingError) {
        return NextResponse.json({ 
          success: false, 
          error: priceError.message 
        }, { status: priceError.status })
      }
      throw priceError
    }

    let finalPrice = price.total
    const discountsApplied = [...price.calculation.discountsApplied]

    // Apply admin override discount if provided (as a final extra discount)
    if (
      body.admin_discount_percentage !== undefined &&
      body.admin_discount_percentage > 0
    ) {
      const adminDiscountAmount = round2(finalPrice * (body.admin_discount_percentage / 100))
      finalPrice = round2(finalPrice - adminDiscountAmount)
      discountsApplied.push({
        type: "admin_override",
        condition: 0,
        percentage: body.admin_discount_percentage,
        behavior: "stack",
        amount: adminDiscountAmount,
      })
    }

    // Use admin override price if provided (wins over everything)
    if (body.admin_override_price !== undefined) {
      finalPrice = round2(parseFloat(body.admin_override_price))
    }

    // Effective discount actually granted vs the gross subtotal — frozen on the row
    const effectiveDiscountPct =
      price.subtotal > 0
        ? Math.min(100, Math.max(0, round2(((price.subtotal - finalPrice) / price.subtotal) * 100)))
        : 0

    const priceBreakdown = {
      ...price.calculation,
      subtotal: price.subtotal,
      discountsApplied,
      totalRoundedMAD: finalPrice,
    }

    // Parse start date
    const startDate = body.start_date 
      ? new Date(body.start_date) 
      : new Date()

    // Calculate renewal date
    const renewsAt = new Date(startDate)
    renewsAt.setDate(renewsAt.getDate() + (body.duration_weeks * 7))

    // Create subscription with the FROZEN configuration and price
    const subscriptionNotes = JSON.stringify({
      payment_method: body.payment_method,
      created_by_admin: true,
      admin_id: authCheck.user?.id,
      admin_notes: body.admin_notes || null,
      admin_discount_percentage: body.admin_discount_percentage || null,
      admin_discount_reason: body.admin_discount_reason || null,
      admin_override_price: body.admin_override_price || null,
      delivery_address: body.delivery_address || null,
      delivery_notes: body.delivery_notes || null,
    })

    const subscriptionResult = await sql`
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
        ${customerId},
        ${mealPlanId},
        ${body.meal_types}::text[],
        ${body.days_per_week},
        ${body.duration_weeks},
        ${price.pricePerDay},
        ${effectiveDiscountPct},
        ${finalPrice},
        'active',
        ${startDate.toISOString()},
        ${renewsAt.toISOString()},
        ${subscriptionNotes}
      )
      RETURNING id, user_id, meal_plan_id, status, starts_at, renews_at, total_mad
    `

    const subscription = subscriptionResult[0]

    // Create order record
    const orderResult = await sql`
      INSERT INTO orders (
        user_id,
        total_amount,
        status,
        created_at,
        updated_at
      )
      VALUES (
        ${customerId},
        ${finalPrice},
        'pending',
        NOW(),
        NOW()
      )
      RETURNING id, user_id, total_amount, status
    `

    const orderId = orderResult[0].id

    // Create order item for subscription
    await sql`
      INSERT INTO order_items (
        order_id,
        product_id,
        description,
        quantity,
        unit_price,
        created_at
      )
      VALUES (
        ${orderId},
        NULL,
        ${`Subscription: ${price.planTitle} (${body.meal_types.join(", ")}, ${body.days_per_week}d/w, ${body.duration_weeks}w)`},
        1,
        ${finalPrice},
        NOW()
      )
    `

    // Generate delivery schedule (one delivery per week on the start weekday)
    const deliveryDates: Date[] = []
    const startDateObj = new Date(startDate)

    for (let week = 0; week < body.duration_weeks; week++) {
      const deliveryDate = new Date(startDateObj)
      deliveryDate.setDate(deliveryDate.getDate() + (week * 7))
      deliveryDates.push(deliveryDate)
    }

    // Create delivery records
    for (const deliveryDate of deliveryDates) {
      await sql`
        INSERT INTO deliveries (
          subscription_id,
          order_id,
          status,
          delivery_date,
          created_at
        )
        VALUES (
          ${subscription.id},
          ${orderId},
          'pending',
          ${deliveryDate.toISOString().split('T')[0]},
          NOW()
        )
      `
    }

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        user_id: subscription.user_id,
        meal_plan_id: subscription.meal_plan_id,
        status: subscription.status,
        starts_at: subscription.starts_at,
        renews_at: subscription.renews_at,
        total_mad: Number(subscription.total_mad),
      },
      order: {
        id: orderId,
        total: finalPrice,
        status: 'pending',
      },
      deliveries: {
        count: deliveryDates.length,
        dates: deliveryDates.map(d => d.toISOString().split('T')[0]),
      },
      priceBreakdown,
      message: "Subscription created successfully",
    })
  } catch (error) {
    console.error("Error creating subscription:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to create subscription"
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 })
  }
}
