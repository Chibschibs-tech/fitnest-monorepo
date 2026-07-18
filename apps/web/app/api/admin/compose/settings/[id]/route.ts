import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export const dynamic = "force-dynamic"

/** Update the rules for one meal type: base price, allowances, max extras. */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const b = await request.json()
    const id = Number(params.id)
    const rows = await sql`
      UPDATE compose_settings SET
        base_price_mad = COALESCE(${b.base_price_mad ?? null}, base_price_mad),
        included_protein = COALESCE(${b.included_protein ?? null}, included_protein),
        included_carb = COALESCE(${b.included_carb ?? null}, included_carb),
        included_veg = COALESCE(${b.included_veg ?? null}, included_veg),
        included_sauce = COALESCE(${b.included_sauce ?? null}, included_sauce),
        max_extras = COALESCE(${b.max_extras ?? null}, max_extras),
        protein_required = COALESCE(${b.protein_required ?? null}, protein_required),
        is_active = COALESCE(${b.is_active ?? null}, is_active),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    if (rows.length === 0) return NextResponse.json({ error: "Introuvable" }, { status: 404 })
    return NextResponse.json({ success: true, data: rows[0] })
  } catch (error) {
    console.error("Error updating compose settings:", error)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}