import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"
import { sql } from "@/lib/db"
import { priceComposedMeal, type ComposeComponent, type ComposeSettings, type Pick } from "@/lib/compose-pricing"

export const dynamic = "force-dynamic"

const COOKIE = "composeId"
const getComposeId = () => cookies().get(COOKIE)?.value

async function loadSettings(mealType: string): Promise<ComposeSettings[]> {
  return await sql`
    SELECT meal_type, base_price_mad, included_protein, included_carb,
           included_veg, included_sauce, max_extras, protein_required
    FROM compose_settings
    WHERE meal_type = ${mealType} AND is_active = true
    LIMIT 1
  `
}

async function loadComponents(): Promise<ComposeComponent[]> {
  return await sql`
    SELECT id, slot, name, portion_grams, kcal, protein_g, carbs_g, fat_g,
           surcharge_mad, extra_portion_price_mad
    FROM compose_components
    WHERE is_active = true
  `
}

export async function GET() {
  try {
    const composeId = getComposeId()
    if (!composeId) return NextResponse.json({ success: true, meals: [] })
    const meals = await sql`
      SELECT id, name, meal_type, components, kcal, protein_g, carbs_g, fat_g,
             price_mad, quantity_per_week
      FROM custom_meals
      WHERE cart_id = ${composeId}
      ORDER BY created_at ASC
    `
    return NextResponse.json({ success: true, meals })
  } catch (error) {
    console.error("Error loading custom meals:", error)
    return NextResponse.json({ error: "Failed to load meals" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const name = String(body.name || "").trim()
    const mealType = String(body.mealType || "Lunch")
    const picks: Pick[] = Array.isArray(body.picks) ? body.picks : []
    const qty = Math.max(1, Math.floor(Number(body.quantityPerWeek) || 1))

    if (!name) return NextResponse.json({ error: "Donne un nom a ton plat." }, { status: 400 })

    const settingsRows = await loadSettings(mealType)
    if (settingsRows.length === 0) {
      return NextResponse.json({ error: "Type de repas inconnu" }, { status: 404 })
    }

    const priced = priceComposedMeal(picks, await loadComponents(), settingsRows[0])
    if (!priced.valid) {
      return NextResponse.json({ error: priced.errors[0] || "Plat invalide" }, { status: 400 })
    }

    let composeId = getComposeId()
    const isNew = !composeId
    if (!composeId) composeId = uuidv4()

    await sql`
      INSERT INTO custom_meals
        (cart_id, name, meal_type, components, kcal, protein_g, carbs_g, fat_g, price_mad, quantity_per_week)
      VALUES
        (${composeId}, ${name}, ${mealType}, ${JSON.stringify(picks)}::jsonb,
         ${priced.kcal}, ${priced.protein_g}, ${priced.carbs_g}, ${priced.fat_g},
         ${priced.total}, ${qty})
    `

    const response = NextResponse.json({ success: true, price: priced.total }, { status: 201 })
    if (isNew) {
      response.cookies.set({
        name: COOKIE, value: composeId, httpOnly: true, path: "/",
        sameSite: "lax", maxAge: 5184000,
      })
    }
    return response
  } catch (error) {
    console.error("Error saving custom meal:", error)
    return NextResponse.json({ error: "Failed to save meal" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const id = Number(body.id)
    const qty = Math.max(0, Math.floor(Number(body.quantityPerWeek) || 0))
    const composeId = getComposeId()
    if (!composeId || !id) return NextResponse.json({ error: "Introuvable" }, { status: 400 })

    if (qty === 0) {
      await sql`DELETE FROM custom_meals WHERE id = ${id} AND cart_id = ${composeId}`
    } else {
      await sql`UPDATE custom_meals SET quantity_per_week = ${qty}, updated_at = NOW() WHERE id = ${id} AND cart_id = ${composeId}`
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating custom meal:", error)
    return NextResponse.json({ error: "Failed to update meal" }, { status: 500 })
  }
}