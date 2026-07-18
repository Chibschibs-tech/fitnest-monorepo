import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export const dynamic = "force-dynamic"

/**
 * Public catalog + rules for the "Compose ton plan" builder.
 * Everything returned here is admin-editable data, never hardcoded.
 */
export async function GET() {
  try {
    const components = await sql`
      SELECT id, slot, name, portion_grams, kcal, protein_g, carbs_g, fat_g,
             surcharge_mad, extra_portion_price_mad, allergens
      FROM compose_components
      WHERE is_active = true
      ORDER BY slot, sort_order, id
    `

    const settings = await sql`
      SELECT meal_type, base_price_mad, included_protein, included_carb,
             included_veg, included_sauce, max_extras, protein_required
      FROM compose_settings
      WHERE is_active = true
      ORDER BY meal_type
    `

    return NextResponse.json({ success: true, components, settings })
  } catch (error) {
    console.error("Error loading compose catalog:", error)
    return NextResponse.json({ error: "Failed to load compose catalog" }, { status: 500 })
  }
}