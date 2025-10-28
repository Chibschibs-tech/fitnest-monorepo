import { NextResponse } from "next/server";
import { q } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; itemId: string } }
) {
  await q(`delete from meal_plan_items where id = $1 and meal_plan_id = $2`, [
    params.itemId,
    params.id,
  ]);
  return NextResponse.json({ ok: true });
}
