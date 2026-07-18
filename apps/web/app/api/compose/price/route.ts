import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { priceComposedMeal, type ComposeComponent, type ComposeSettings, type Pick } from "@/lib/compose-pricing"

export const dynamic = "force-dynamic"

/**
 * Server-side price + macros for a composed meal.
 * The client never computes the price it will be charged.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const mealType = String(body.mealType || "Lunch")
    const picks: Pick[] = Array.isArray(body.picks) ? body.picks : []

    const settingsRows: ComposeSettings[] = await sql`
      SELECT meal_type, base_price_mad, included_protein, included_carb,
             included_veg, included_sauce, max_extras, protein_required
      FROM compose_settings
      WHERE meal_type = ${mealType} AND is_active = true
      LIMIT 1
    `

    if (settingsRows.length === 0) {
      return NextResponse.json({ error: "Type de repas inconnu" }, { status: 404 })
    }

    const components: ComposeComponent[] = await sql`
      SELECT id, slot, name, portion_grams, kcal, protein_g, carbs_g, fat_g,
             surcharge_mad, extra_portion_price_mad
      FROM compose_components
      WHERE is_active = true
    `

    const result = priceComposedMeal(picks, components, settingsRows[0])
    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error("Error pricing composed meal:", error)
    return NextResponse.json({ error: "Failed to price composed meal" }, { status: 500 })
  }
}