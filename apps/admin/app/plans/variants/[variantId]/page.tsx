"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-browser";

type Meal = { id: number; title: string; slug: string; kcal: number | null };

type Variant = {
  id: number;
  label: string;
  days_per_week: number;
  meals_per_day: number;
};

type PlanMeal = {
  id: number;
  day_index: number;
  slot_index: number;
  meal_id: number | null;
};

export default function VariantGridPage({
  params,
}: {
  params: { planId: string; variantId: string };
}) {
  const planId = params.planId;
  const variantId = Number(params.variantId);

  const [variant, setVariant] = useState<Variant | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [grid, setGrid] = useState<PlanMeal[][]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Charge variant + meals + plan_meals
  useEffect(() => {
    (async () => {
      setLoading(true);

      // 1) Variante
      const { data: v, error: vErr } = await supabase
        .from("plan_variants")
        .select("id,label,days_per_week,meals_per_day")
        .eq("id", variantId)
        .single();

      if (vErr || !v) {
        alert("Erreur variant: " + (vErr?.message ?? "introuvable"));
        setVariant(null);
        setLoading(false);
        return;
      }
      setVariant(v as Variant);

      // 2) Meals (tous)
      const { data: m, error: mErr } = await supabase
        .from("meals")
        .select("id,title,slug,kcal")
        .order("title", { ascending: true });

      if (mErr) {
        alert("Erreur meals: " + mErr.message);
        setLoading(false);
        return;
      }
      setMeals((m as Meal[]) ?? []);

      // 3) plan_meals existants
      const { data: pm, error: pmErr } = await supabase
        .from("plan_meals")
        .select("id,day_index,slot_index,meal_id")
        .eq("plan_variant_id", variantId);

      if (pmErr) {
        alert("Erreur plan_meals: " + pmErr.message);
        setLoading(false);
        return;
      }

      // Construire la grille
      const rows: PlanMeal[][] = [];
      for (let d = 0; d < v.days_per_week; d++) {
        const row: PlanMeal[] = [];
        for (let s = 0; s < v.meals_per_day; s++) {
          const found = pm?.find((x) => x.day_index === d && x.slot_index === s);
          row.push({
            id: found?.id ?? 0, // 0 => nouveau (pas encore en DB)
            day_index: d,
            slot_index: s,
            meal_id: found?.meal_id ?? null,
          });
        }
        rows.push(row);
      }
      setGrid(rows);
      setLoading(false);
    })();
  }, [variantId]);

  function handleChange(d: number, s: number, value: string) {
    const mealId = value === "" ? null : Number(value);
    setGrid((g) => {
      const copy = g.map((row) => row.slice());
      copy[d][s] = { ...copy[d][s], meal_id: mealId };
      return copy;
    });
  }

  async function saveAll() {
    if (!variant) return;
    setSaving(true);
    try {
      // Aplatir la grille
      const payload = grid.flatMap((row) => row);

      // Upsert par (plan_variant_id, day_index, slot_index)
      const upsertRows = payload.map((cell) => ({
        id: cell.id || undefined, // si 0 → undefined pour insert
        plan_variant_id: variant.id,
        day_index: cell.day_index,
        slot_index: cell.slot_index,
        meal_id: cell.meal_id,
      }));

      const { error } = await supabase
        .from("plan_meals")
        .upsert(upsertRows, { onConflict: "plan_variant_id,day_index,slot_index" })
        .select("id,day_index,slot_index");

      if (error) {
        alert("Erreur enregistrement: " + error.message);
        return;
      }
      alert("Grille enregistrée ✅");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main style={{ padding: 24 }}>
        <p>Chargement…</p>
      </main>
    );
  }

  if (!variant) {
    return (
      <main style={{ padding: 24 }}>
        <nav style={{ display: "flex", gap: 16, marginBottom: 24 }}>
          <Link href="/">Dashboard</Link>
          <Link href={`/plans/${planId}`}>Retour au plan</Link>
        </nav>
        <p>Variante introuvable.</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <nav style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <Link href="/">Dashboard</Link>
        <Link href={`/plans/${planId}`}>Retour au plan</Link>
      </nav>

      <h1>{variant.label}</h1>
      <p>
        {variant.days_per_week} jours • {variant.meals_per_day} repas / jour
      </p>

      <div style={{ margin: "16px 0" }}>
        <button disabled={saving} onClick={saveAll}>
          {saving ? "Enregistrement…" : "Enregistrer la grille"}
        </button>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        {grid.map((row, d) => (
          <div key={d}>
            <h3>Jour {d + 1}</h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {row.map((cell, s) => (
                <div key={s} style={{ minWidth: 260 }}>
                  <label style={{ display: "block", fontSize: 12 }}>
                    Créneau {s + 1}
                  </label>
                  <select
                    value={cell.meal_id ?? ""}
                    onChange={(e) => handleChange(d, s, e.target.value)}
                    style={{ width: "100%" }}
                  >
                    <option value="">— Aucun —</option>
                    {meals.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title} {m.kcal ? `(${m.kcal} kcal)` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
