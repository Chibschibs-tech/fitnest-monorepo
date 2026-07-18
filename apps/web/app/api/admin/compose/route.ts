import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export const dynamic = "force-dynamic"

const SLOTS = ["protein", "carb", "veg", "sauce", "extra"]

/** Everything the admin panel needs for "Compose ton plan". */
export async function GET() {
  try {
    const components = await sql`
      SELECT id, slot, name, portion_grams, kcal, protein_g, carbs_g, fat_g,
             surcharge_mad, extra_portion_price_mad, is_active, sort_order
      FROM compose_components
      ORDER BY slot, sort_order, id
    `
    const settings = await sql`
      SELECT id, meal_type, base_price_mad, included_protein, included_carb,
             included_veg, included_sauce, max_extras, protein_required, is_active
      FROM compose_settings
      ORDER BY meal_type
    `
    return NextResponse.json({ success: true, components, settings })
  } catch (error) {
    console.error("Error loading compose admin data:", error)
    return NextResponse.json({ error: "Failed to load" }, { status: 500 })
  }
}

/** Create a component (ingredient option). */
export async function POST(request: NextRequest) {
  try {
    const b = await request.json()
    const slot = String(b.slot || "")
    const name = String(b.name || "").trim()
    if (!SLOTS.includes(slot)) {
      return NextResponse.json({ error: "Categorie invalide" }, { status: 400 })
    }
    if (!name) return NextResponse.json({ error: "Nom obligatoire" }, { status: 400 })

    const rows = await sql`
      INSERT INTO compose_components
        (slot, name, portion_grams, kcal, protein_g, carbs_g, fat_g,
         surcharge_mad, extra_portion_price_mad, sort_order)
      VALUES
        (${slot}, ${name}, ${Number(b.portion_grams) || 100}, ${Number(b.kcal) || 0},
         ${Number(b.protein_g) || 0}, ${Number(b.carbs_g) || 0}, ${Number(b.fat_g) || 0},
         ${Number(b.surcharge_mad) || 0}, ${Number(b.extra_portion_price_mad) || 0},
         ${Number(b.sort_order) || 0})
      RETURNING *
    `
    return NextResponse.json({ success: true, data: rows[0] }, { status: 201 })
  } catch (error) {
    console.error("Error creating component:", error)
    return NextResponse.json({ error: "Failed to create" }, { status: 500 })
  }
}