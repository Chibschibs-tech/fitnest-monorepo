import { NextResponse } from "next/server";
import { supabase } from "@fitnest/db";

export async function GET() {
  try {
    // requête triviale sur une table existante pour valider la connexion
    const { data, error } = await supabase
      .from("meal_type_prices")
      .select("id")
      .limit(1);

    if (error) throw error;
    return NextResponse.json({ ok: true, sample: data ?? [] });
  } catch (e: any) {
    console.error("DB PING ERROR:", e);
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
