import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@fitnest/db";

export async function GET() {
  const { data, error } = await supabase
    .from("discount_rules")
    .select("id,discount_type,condition_value,discount_percentage,stackable,is_active,valid_from,valid_to")
    .order("discount_type").order("condition_value");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: NextRequest) {
  const b = await req.json();
  const { id, discount_type, condition_value, discount_percentage, stackable = true, is_active = true, valid_from=null, valid_to=null } = b ?? {};
  if (!discount_type || typeof condition_value!=="number" || typeof discount_percentage!=="number") {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const { data, error } = await supabase
    .from("discount_rules")
    .upsert({ id, discount_type, condition_value, discount_percentage, stackable, is_active, valid_from, valid_to })
    .select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data?.[0] ?? null });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const { error } = await supabase.from("discount_rules").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
