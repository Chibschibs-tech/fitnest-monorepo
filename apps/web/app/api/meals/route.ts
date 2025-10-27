import { NextResponse } from "next/server";
import { supabase } from "@fitnest/db";

export async function GET() {
  const { data, error } = await supabase
    .from("meals")
    .select("*")
    .eq("is_active", true)
    .order("week_number", { ascending: true })
    .order("day_of_week", { ascending: true })
    .order("meal_type", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}
