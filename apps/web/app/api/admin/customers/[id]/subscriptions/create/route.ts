export const dynamic = "force-dynamic"
export const revalidate = 0

import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSessionUser } from "@/lib/simple-auth"
import { Errors } from "@/lib/error-handler"
import {
  calculateSubscriptionPrice,
  type MealPrice,
  type DiscountRule,
} from "@/lib/pricing-calculator"

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
    if (!body.plan_variant_id) {
      return NextResponse.json({ 
        success: false, 
        error: "plan_variant_id is required" 
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

    // Get plan variant details
    const planVariant = await sql`
      SELECT 
        pv.id,
        pv.meal_plan_id,
        pv.label,
        pv.weekly_price_mad as weekly_base_price_mad,
        pv.days_per_week as variant_days_per_week,
        pv.meals_per_day,
        mp.title as meal_plan_title,
        mp.slug as meal_plan_slug
      FROM plan_variants pv
      JOIN meal_plans mp ON pv.meal_plan_id = mp.id
      WHERE pv.id = ${body.plan_variant_id}
    `

    if (planVariant.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Plan variant not found" 
      }, { status: 404 })
    }

    const variant = planVariant[0]

    // Calculate price using the shared pricing calculator
    let calculatedPrice = 0
    let priceBreakdown: any = null

    try {
      // Get meal prices for the variant's meal plan (by title/plan name)
      const mealPrices: MealPrice[] = await sql`
        SELECT meal_type, base_price_mad
        FROM meal_type_prices
        WHERE plan_name = ${variant.meal_plan_title}
          AND meal_type = ANY(${body.meal_types}::text[])
          AND is_active = true
      `

      if (mealPrices.length === 0) {
        // If no meal prices are found, fall back to variant weekly price
        console.warn("No meal_type_prices found for plan", variant.meal_plan_title)
        const baseWeekly =
          parseFloat(variant.weekly_base_price_mad || variant.weekly_price_mad || 0) || 0
        calculatedPrice = baseWeekly * body.duration_weeks
      } else {
        const discountRules: DiscountRule[] = await sql`
          SELECT discount_type, condition_value, discount_percentage, stackable
          FROM discount_rules
          WHERE is_active = true
            AND (valid_from IS NULL OR valid_from <= NOW())
            AND (valid_to IS NULL OR valid_to >= NOW())
        `

        const result = calculateSubscriptionPrice(
          mealPrices,
          body.days_per_week,
          body.duration_weeks,
          discountRules,
          variant.meal_plan_title,
          body.meal_types,
        )

        let finalWeekly = result.finalWeekly
        const discountsApplied = [...result.discountsApplied]

        // Apply admin override discount if provided (as a final extra discount)
        if (
          body.admin_discount_percentage !== undefined &&
          body.admin_discount_percentage > 0
        ) {
          const adminDiscountAmount = finalWeekly * (body.admin_discount_percentage / 100)
          finalWeekly -= adminDiscountAmount
          discountsApplied.push({
            type: "admin_override",
            condition: 0,
            percentage: body.admin_discount_percentage,
            amount: adminDiscountAmount,
          })
        }

        calculatedPrice = Math.round(finalWeekly * body.duration_weeks * 100) / 100

        priceBreakdown = {
          ...result,
          finalWeekly,
          totalRoundedMAD: calculatedPrice,
          discountsApplied,
        }
      }
    } catch (priceError) {
      console.error("Error calculating price:", priceError)
      // Fallback to plan variant base price
      const baseWeekly =
        parseFloat(variant.weekly_base_price_mad || variant.weekly_price_mad || 0) || 0
      calculatedPrice = baseWeekly * body.duration_weeks
    }

    // Use admin override price if provided
    const finalPrice = body.admin_override_price !== undefined 
      ? parseFloat(body.admin_override_price) 
      : calculatedPrice

    // Parse start date
    const startDate = body.start_date 
      ? new Date(body.start_date) 
      : new Date()

    // Calculate renewal date
    const renewsAt = new Date(startDate)
    renewsAt.setDate(renewsAt.getDate() + (body.duration_weeks * 7))

    // Create subscription
    const subscriptionNotes = JSON.stringify({
      meal_types: body.meal_types,
      days_per_week: body.days_per_week,
      duration_weeks: body.duration_weeks,
      total_price: finalPrice,
      payment_method: body.payment_method,
      created_by_admin: true,
      admin_id: authCheck.user?.id,
      admin_notes: body.admin_notes || null,
      delivery_address: body.delivery_address || null,
      delivery_notes: body.delivery_notes || null,
    })

    const subscriptionResult = await sql`
      INSERT INTO subscriptions (
        user_id,
        plan_variant_id,
        status,
        starts_at,
        renews_at,
        notes
      )
      VALUES (
        ${customerId},
        ${body.plan_variant_id},
        'active',
        ${startDate.toISOString()},
        ${renewsAt.toISOString()},
        ${subscriptionNotes}
      )
      RETURNING id, user_id, plan_variant_id, status, starts_at, renews_at
    `

    const subscription = subscriptionResult[0]

    // Create order record
    const orderResult = await sql`
      INSERT INTO orders (
        user_id,
        total,
        status,
        created_at,
        updated_at
      )
      VALUES (
        ${customerId},
        ${Math.round(finalPrice * 100)},
        'pending',
        NOW(),
        NOW()
      )
      RETURNING id, user_id, total, status
    `

    const orderId = orderResult[0].id

    // Create order item for subscription
    await sql`
      INSERT INTO order_items (
        order_id,
        product_id,
        quantity,
        unit_price,
        created_at
      )
      VALUES (
        ${orderId},
        NULL,
        1,
        ${Math.round(finalPrice * 100)},
        NOW()
      )
    `

    // Generate delivery schedule
    const deliveryDates: Date[] = []
    const startDateObj = new Date(startDate)
    
    // Generate deliveries for each week
    for (let week = 0; week < body.duration_weeks; week++) {
      // For each day of the week selected
      // For simplicity, we'll create one delivery per week on the first day
      // You can enhance this to create deliveries for each selected day
      const deliveryDate = new Date(startDateObj)
      deliveryDate.setDate(deliveryDate.getDate() + (week * 7))
      deliveryDates.push(deliveryDate)
    }

    // Create delivery records
    for (const deliveryDate of deliveryDates) {
      await sql`
        INSERT INTO deliveries (
          order_id,
          status,
          scheduled_date,
          created_at
        )
        VALUES (
          ${orderId},
          'scheduled',
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
        plan_variant_id: subscription.plan_variant_id,
        status: subscription.status,
        starts_at: subscription.starts_at,
        renews_at: subscription.renews_at,
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

