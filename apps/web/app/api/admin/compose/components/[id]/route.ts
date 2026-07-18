import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export const dynamic = "force-dynamic"

/** Update one ingredient option: price, macros, portion, availability. */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const b = await request.json()
    const id = Number(params.id)
    const rows = await sql`
      UPDATE compose_components SET
        name = COALESCE(${b.name ?? null}, name),
        portion_grams = COALESCE(${b.portion_grams ?? null}, portion_grams),
        kcal = COALESCE(${b.kcal ?? null}, kcal),
        protein_g = COALESCE(${b.protein_g ?? null}, protein_g),
        carbs_g = COALESCE(${b.carbs_g ?? null}, carbs_g),
        fat_g = COALESCE(${b.fat_g ?? null}, fat_g),
        surcharge_mad = COALESCE(${b.surcharge_mad ?? null}, surcharge_mad),
        extra_portion_price_mad = COALESCE(${b.extra_portion_price_mad ?? null}, extra_portion_price_mad),
        is_active = COALESCE(${b.is_active ?? null}, is_active),
        sort_order = COALESCE(${b.sort_order ?? null}, sort_order),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    if (rows.length === 0) return NextResponse.json({ error: "Introuvable" }, { status: 404 })
    return NextResponse.json({ success: true, data: rows[0] })
  } catch (error) {
    console.error("Error updating component:", error)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await sql`UPDATE compose_components SET is_active = false, updated_at = NOW() WHERE id = ${Number(params.id)}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error archiving component:", error)
    return NextResponse.json({ error: "Failed to archive" }, { status: 500 })
  }
}