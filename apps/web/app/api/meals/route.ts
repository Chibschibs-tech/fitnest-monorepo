import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@fitnest/db";

// Important: pas de cache côté edge / browser pour les filtres
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const type = (searchParams.get("type") || "All").trim(); // "All" | "Breakfast" | "Lunch" | "Dinner" | etc.
    const week = searchParams.get("week"); // string | null (p.ex. "44")
    const day = searchParams.get("day"); // string | null (p.ex. "1-7" ou "3")
    const activeOnly = searchParams.get("activeOnly") ?? "false"; // "true" | "false"

    // Sélection de base
    let q = supabase.from("meals").select("*");

    // Aligne avec la colonne réelle: meal_type (et non "type")
    if (type && type !== "All") {
      q = q.eq("meal_type", type);
    }

    if (week && week !== "All") {
      const w = Number(week);
      if (!Number.isNaN(w)) q = q.eq("week", w);
    }

    if (day && day !== "All") {
      // Si l'UI envoie "1-7" on ne filtre pas; si elle envoie "3" on filtre
      if (/^\d+$/.test(day)) {
        q = q.eq("day", Number(day));
      }
    }

    if (activeOnly === "true") {
      q = q.eq("is_active", true);
    }

    // Tri récent -> ancien (libre d'ajuster)
    q = q.order("created_at", { ascending: false });

    const { data, error } = await q;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ items: data ?? [] }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 },
    );
  }
}
