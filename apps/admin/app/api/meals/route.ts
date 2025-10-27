import { NextResponse } from "next/server";
import { supabase } from "@fitnest/db";

export async function GET() {
  const { data, error } = await supabase
    .from("meals")
    .select("*")
    .order("id", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { data, error } = await supabase
    .from("meals")
    .insert({
      title: body.title,
      meal_type: body.meal_type,
      description: body.description ?? null,
      calories: body.calories ?? null,
      protein_g: body.protein_g ?? null,
      carbs_g: body.carbs_g ?? null,
      fat_g: body.fat_g ?? null,
      image_url: body.image_url ?? null,
      day_of_week: body.day_of_week ?? null,
      week_number: body.week_number ?? null,
      is_active: body.is_active ?? true,
    })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const { error } = await supabase.from("meals").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
