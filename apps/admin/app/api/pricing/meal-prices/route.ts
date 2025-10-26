import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@fitnest/db";

export async function GET() {
  const { data, error } = await supabase
    .from("meal_type_prices")
    .select("id,plan_name,meal_type,base_price_mad,is_active")
    .order("plan_name").order("meal_type");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { id, plan_name, meal_type, base_price_mad, is_active = true } = body ?? {};
  if (!plan_name || !meal_type || typeof base_price_mad !== "number") {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  // upsert par unicité (plan_name, meal_type)
  const { data, error } = await supabase
    .from("meal_type_prices")
    .upsert({ id, plan_name, meal_type, base_price_mad, is_active })
    .select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data?.[0] ?? null });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const { error } = await supabase.from("meal_type_prices").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
