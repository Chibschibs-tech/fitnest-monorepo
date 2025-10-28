import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@fitnest/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
    const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);

    const { data, error, count } = await supabase
      .from("meals")
      .select("*", { count: "estimated" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ items: data ?? [], total: count ?? 0 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "GET failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const required = ["title", "price_mad", "type"];
    for (const k of required) {
      if (body[k] === undefined || body[k] === null || body[k] === "") {
        return NextResponse.json({ error: `Missing field: ${k}` }, { status: 400 });
      }
    }

    const insert = {
      title: String(body.title),
      description: String(body.description || ""),
      price_mad: Number(body.price_mad) || 0,
      calories: Number(body.calories) || 0,
      protein_g: Number(body.protein_g) || 0,
      carbs_g: Number(body.carbs_g) || 0,
      fat_g: Number(body.fat_g) || 0,
      image_url: String(body.image_url || ""),
      is_active: body.is_active !== false,
      type: String(body.type || ""),
      week: body.week != null ? Number(body.week) : null,
      day: body.day != null ? Number(body.day) : null,
    };

    const { data, error } = await supabase.from("meals").insert(insert).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ item: data }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "POST failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const { error } = await supabase.from("meals").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "DELETE failed" }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
