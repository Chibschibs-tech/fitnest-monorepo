import { NextResponse } from "next/server";
import { supabase } from "@fitnest/db";

export async function GET(req: Request){
  try{
    const url = new URL(req.url);
    const active = url.searchParams.get("active");
    const week = url.searchParams.get("week");
    const day = url.searchParams.get("day");
    const type = url.searchParams.get("type");

    let q = supabase.from("meals")
      .select("id, title, type, calories, protein_g, carbs_g, fat_g, image_url, week, day, is_active")
      .order("title", { ascending: true });

    if(active === "1") q = q.eq("is_active", true);
    if(week) q = q.eq("week", Number(week));
    if(day) q = q.eq("day", Number(day));
    if(type) q = q.eq("type", type);

    const { data, error } = await q;
    if(error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ items: data ?? [] });
  }catch(e:any){
    return NextResponse.json({ error: e?.message || "Erreur" }, { status: 500 });
  }
}
