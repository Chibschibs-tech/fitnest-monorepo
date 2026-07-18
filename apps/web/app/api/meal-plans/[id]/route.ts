export const dynamic = "force-dynamic"
export const revalidate = 0

import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getPlanEntryPrices } from "@/lib/plan-pricing"

/**
 * Public meal-plan detail.
 *
 * Rewritten against the REAL schema (meal_plans / plan_variants / meal_plan_meals /
 * meals). The previous version queried columns and a table that do not exist
 * (name, plan_type, weekly_price, meal_plan_items) and always returned 500.
 *
 * Price comes from the pricing engine, never from a stored value, so it can
 * never disagree with the builder or checkout.
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const raw = params.id
    const asId = Number.parseInt(raw)
    const isNumeric = !Number.isNaN(asId)

    const plans = isNumeric
      ? await sql`
          SELECT mp.id, mp.slug, mp.title, mp.summary, mp.audience, mp.image_url, mp.published,
                 mpc.name AS category
          FROM meal_plans mp
          LEFT JOIN mp_categories mpc ON mp.mp_category_id = mpc.id
          WHERE mp.id = ${asId} AND mp.published = true
        `
      : await sql`
          SELECT mp.id, mp.slug, mp.title, mp.summary, mp.audience, mp.image_url, mp.published,
                 mpc.name AS category
          FROM meal_plans mp
          LEFT JOIN mp_categories mpc ON mp.mp_category_id = mpc.id
          WHERE mp.slug = ${raw} AND mp.published = true
        `

    if (plans.length === 0) {
      return NextResponse.json({ message: "Meal plan not found" }, { status: 404 })
    }

    const plan = plans[0]

    const variants = await sql`
      SELECT id, label, days_per_week, meals_per_day
      FROM plan_variants
      WHERE meal_plan_id = ${plan.id} AND published = true
      ORDER BY days_per_week ASC, meals_per_day ASC
    `

    const meals = await sql`
      SELECT m.id, m.slug, m.title, m.description, m.meal_type, m.category,
             m.kcal, m.protein, m.carbs, m.fat, m.fiber, m.image_url, m.allergens, m.tags,
             mpm.sort_order
      FROM meal_plan_meals mpm
      JOIN meals m ON mpm.meal_id = m.id
      WHERE mpm.meal_plan_id = ${plan.id} AND m.published = true
      ORDER BY mpm.sort_order ASC NULLS LAST, m.id ASC
    `

    const priceMap = await getPlanEntryPrices([plan.title])
    const entry = priceMap[plan.title] ?? null

    return NextResponse.json({
      id: plan.id,
      slug: plan.slug,
      name: plan.title,
      description: plan.summary,
      audience: plan.audience,
      category: plan.category,
      imageUrl: plan.image_url,
      published: plan.published,
      // "A partir de" price, computed by the pricing engine.
      entryPrice: entry ? { perDay: entry.pricePerDay, weekly: entry.weekly } : null,
      variants: variants.map((v: any) => ({
        id: v.id,
        label: v.label,
        daysPerWeek: v.days_per_week,
        mealsPerDay: v.meals_per_day,
      })),
      meals: meals.map((m: any) => ({
        id: m.id,
        slug: m.slug,
        name: m.title,
        description: m.description,
        mealType: m.meal_type,
        category: m.category,
        imageUrl: m.image_url,
        allergens: m.allergens,
        tags: m.tags,
        calories: m.kcal,
        protein: Number(m.protein ?? 0),
        carbs: Number(m.carbs ?? 0),
        fat: Number(m.fat ?? 0),
        fiber: Number(m.fiber ?? 0),
        sortOrder: m.sort_order,
      })),
    })
  } catch (error) {
    console.error("Error fetching meal plan:", error)
    return NextResponse.json({ message: "Failed to fetch meal plan" }, { status: 500 })
  }
}
