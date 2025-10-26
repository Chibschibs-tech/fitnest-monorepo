"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";

type Plan = {
  id: string; // uuid
  title: string;
  slug: string;
  audience: string;
};

type Variant = {
  id: number; // serial
  meal_plan_id: string; // uuid FK
  label: string;
  days_per_week: number;
  meals_per_day: number;
  weekly_base_price_mad: number;
  published: boolean;
};

type Meal = { id: number; slug: string; title: string; kcal: number | null };

export default function PlanDetailPage() {
  // next/navigation returns string|string[]; normalize to string
  const { planId } = useParams() as { planId: string };

  const [plan, setPlan] = useState<Plan | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  // create-variant form
  const [label, setLabel] = useState("5 jours • 3 repas/jour");
  const [daysPerWeek, setDaysPerWeek] = useState(5);
  const [mealsPerDay, setMealsPerDay] = useState(3);
  const [weeklyPrice, setWeeklyPrice] = useState<string>("899");

  // inline grid editor state
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const selectedVariant = useMemo(
    () => variants.find((v) => v.id === selectedVariantId) || null,
    [variants, selectedVariantId]
  );
  const [grid, setGrid] = useState<Record<string, number | null>>({});
  const [gridLoading, setGridLoading] = useState(false);

  useEffect(() => {
    void bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId]);

  async function bootstrap() {
    setLoading(true);

    const [planRes, variantsRes, mealsRes] = await Promise.all([
      supabase.from("meal_plans").select("id,title,slug,audience").eq("id", planId).single(),
      supabase.from("plan_variants").select("*").eq("meal_plan_id", planId).order("created_at", { ascending: true }),
      supabase.from("meals").select("id,slug,title,kcal").order("id"),
    ]);

    if (planRes.error) alert(`Load plan error: ${planRes.error.message}`);
    else setPlan(planRes.data as Plan);

    if (variantsRes.error) alert(`Load variants error: ${variantsRes.error.message}`);
    else setVariants((variantsRes.data as Variant[]) ?? []);

    if (mealsRes.error) alert(`Load meals error: ${mealsRes.error.message}`);
    else setMeals((mealsRes.data as Meal[]) ?? []);

    setLoading(false);
  }

  async function createVariant(e: React.FormEvent) {
    e.preventDefault();
    if (!planId) return;

    const payload = {
      meal_plan_id: planId,
      label,
      days_per_week: Number(daysPerWeek),
      meals_per_day: Number(mealsPerDay),
      weekly_base_price_mad: Number(weeklyPrice),
      published: true,
    };

    const { error } = await supabase.from("plan_variants").insert([payload]);
    if (error) return alert(`Create variant error: ${error.message}`);

    setLabel("5 jours • 3 repas/jour");
    setDaysPerWeek(5);
    setMealsPerDay(3);
    setWeeklyPrice("899");
    await bootstrap();
  }

  async function deleteVariant(id: number) {
    if (!confirm("Supprimer cette variante ?")) return;
    const { error } = await supabase.from("plan_variants").delete().eq("id", id);
    if (error) return alert(`Delete variant error: ${error.message}`);
    if (selectedVariantId === id) setSelectedVariantId(null);
    await bootstrap();
  }

  // load grid when a variant is selected
  useEffect(() => {
    if (!selectedVariant) return;
    void loadGrid(selectedVariant);
  }, [selectedVariant?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadGrid(variant: Variant) {
    setGridLoading(true);
    const { data, error } = await supabase
      .from("plan_meals")
      .select("day_index,slot_index,meal_id")
      .eq("plan_variant_id", variant.id);

    if (error) {
      alert(`Load grid error: ${error.message}`);
      setGrid({});
      setGridLoading(false);
      return;
    }

    const next: Record<string, number | null> = {};
    for (let d = 0; d < variant.days_per_week; d++) {
      for (let s = 0; s < variant.meals_per_day; s++) {
        next[`${d}:${s}`] = null;
      }
    }
    (data ?? []).forEach((row: any) => {
      next[`${row.day_index}:${row.slot_index}`] = row.meal_id as number;
    });

    setGrid(next);
    setGridLoading(false);
  }

  async function saveCell(d: number, s: number, mealId: number | null) {
    if (!selectedVariant) return;
    const key = `${d}:${s}`;
    setGrid((curr) => ({ ...curr, [key]: mealId }));

    if (mealId == null) {
      // delete the cell
      const { error } = await supabase
        .from("plan_meals")
        .delete()
        .eq("plan_variant_id", selectedVariant.id)
        .eq("day_index", d)
        .eq("slot_index", s);
      if (error) alert(`Clear cell error: ${error.message}`);
      return;
    }

    const { error } = await supabase
      .from("plan_meals")
      .upsert(
        [
          {
            plan_variant_id: selectedVariant.id,
            day_index: d,
            slot_index: s,
            meal_id: mealId,
          },
        ],
        { onConflict: "plan_variant_id,day_index,slot_index" }
      );

    if (error) alert(`Save cell error: ${error.message}`);
  }

  if (loading) {
    return (
      <main style={{ padding: 24 }}>
        <nav style={{ display: "flex", gap: 16, marginBottom: 24 }}>
          <Link href="/">Dashboard</Link>
          <Link href="/meals">Meals</Link>
          <Link href="/plans">
            <strong>Plans</strong>
          </Link>
        </nav>
        <p>Loading…</p>
      </main>
    );
  }

  if (!plan) {
    return (
      <main style={{ padding: 24 }}>
        <p>Plan introuvable.</p>
        <Link href="/plans">← Retour</Link>
      </main>
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <nav style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <Link href="/">Dashboard</Link>
        <Link href="/meals">Meals</Link>
        <Link href="/plans">
          <strong>Plans</strong>
        </Link>
      </nav>

      <h1 style={{ marginBottom: 4 }}>{plan.title}</h1>
      <div style={{ color: "#666", marginBottom: 24 }}>
        slug: {plan.slug} • audience: {plan.audience}
      </div>

      {/* Create variant */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ marginBottom: 8 }}>Créer une variante</h2>
        <form onSubmit={createVariant} style={{ display: "grid", gap: 8, maxWidth: 520 }}>
          <input placeholder="Label" value={label} onChange={(e) => setLabel(e.target.value)} />
          <div style={{ display: "flex", gap: 8 }}>
            <input
              placeholder="Jours/sem."
              value={daysPerWeek}
              inputMode="numeric"
              onChange={(e) => {
                const v = e.target.value;
                if (/^\d*$/.test(v)) setDaysPerWeek(v === "" ? 0 : Number(v));
              }}
            />
            <input
              placeholder="Repas/jour"
              value={mealsPerDay}
              inputMode="numeric"
              onChange={(e) => {
                const v = e.target.value;
                if (/^\d*$/.test(v)) setMealsPerDay(v === "" ? 0 : Number(v));
              }}
            />
            <input
              placeholder="Prix/semaine (MAD)"
              value={weeklyPrice}
              inputMode="decimal"
              onChange={(e) => setWeeklyPrice(e.target.value)}
            />
          </div>
          <button type="submit">Créer la variante</button>
        </form>
      </section>

      {/* Variants list */}
      <section style={{ marginBottom: 24 }}>
        <h2 style={{ marginBottom: 8 }}>Variantes</h2>
        {variants.length === 0 ? (
          <p>Aucune variante.</p>
        ) : (
          <ul style={{ display: "grid", gap: 8 }}>
            {variants.map((v) => (
              <li key={v.id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
                <div style={{ fontWeight: 600 }}>{v.label}</div>
                <div style={{ color: "#666", margin: "4px 0" }}>
                  {v.days_per_week} jours / {v.meals_per_day} repas • {v.weekly_base_price_mad} MAD/sem •{" "}
                  {v.published ? "publié" : "brouillon"}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setSelectedVariantId(v.id)}>Ouvrir la grille</button>
                  <button onClick={() => deleteVariant(v.id)} style={{ color: "#a00" }}>
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Grid editor */}
      {selectedVariant && (
        <section style={{ marginTop: 24 }}>
          <h2 style={{ marginBottom: 8 }}>
            Grille — {selectedVariant.label} ({selectedVariant.days_per_week} jours × {selectedVariant.meals_per_day} repas)
          </h2>

          {gridLoading ? (
            <p>Chargement de la grille…</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", minWidth: 720 }}>
                <thead>
                  <tr>
                    <th style={th}></th>
                    {Array.from({ length: selectedVariant.meals_per_day }).map((_, s) => (
                      <th key={`h${s}`} style={th}>
                        Slot {s + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: selectedVariant.days_per_week }).map((_, d) => (
                    <tr key={`r${d}`}>
                      <td style={th}>Jour {d + 1}</td>
                      {Array.from({ length: selectedVariant.meals_per_day }).map((_, s) => {
                        const key = `${d}:${s}`;
                        const currentMealId = grid[key] ?? null;
                        return (
                          <td key={`c${d}-${s}`} style={td}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <select
                                value={currentMealId ?? ""}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  const val = v === "" ? null : Number(v);
                                  void saveCell(d, s, val);
                                }}
                              >
                                <option value="">— Choisir —</option>
                                {meals.map((m) => (
                                  <option key={m.id} value={m.id}>
                                    {m.title} ({m.slug})
                                  </option>
                                ))}
                              </select>
                              {currentMealId !== null && (
                                <button onClick={() => saveCell(d, s, null)} title="Effacer">
                                  ✕
                                </button>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

const th: React.CSSProperties = { textAlign: "left", borderBottom: "1px solid #ccc", padding: "8px 6px" };
const td: React.CSSProperties = { borderBottom: "1px solid #eee", padding: "8px 6px" };
