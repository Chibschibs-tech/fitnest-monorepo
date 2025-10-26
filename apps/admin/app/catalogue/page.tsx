"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";

type Plan = { id: string; title: string; slug: string; audience: string };
type Variant = {
  id: string; // UUID
  meal_plan_id: string;
  label: string;
  days_per_week: number;
  meals_per_day: number;
  weekly_base_price_mad: number | null;
  published: boolean;
};

export default function CataloguePage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [variants, setVariants] = useState<Record<string, Variant[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [pRes, vRes] = await Promise.all([
        supabase.from("meal_plans").select("id,title,slug,audience").order("title"),
        supabase.from("plan_variants").select(`
          id, meal_plan_id, label, days_per_week, meals_per_day, weekly_base_price_mad, published
        `).eq("published", true).order("meal_plan_id"),
      ]);

      if (!pRes.error) setPlans((pRes.data ?? []) as Plan[]);
      if (!vRes.error) {
        const byPlan: Record<string, Variant[]> = {};
        (vRes.data ?? []).forEach((v: any) => {
          byPlan[v.meal_plan_id] ??= [];
          byPlan[v.meal_plan_id].push(v as Variant);
        });
        setVariants(byPlan);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <main>
      <h1 style={{ marginBottom: 16 }}>Nos formules</h1>
      {loading ? <p>Chargement…</p> : (
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          {plans.map(p => (
            <div key={p.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{p.title}</div>
              <div style={{ color: "#666", marginTop: 2 }}>Audience : {p.audience}</div>

              {(variants[p.id] ?? []).length === 0 ? (
                <p style={{ marginTop: 12, color: "#666" }}>Aucune variante publiée.</p>
              ) : (
                <ul style={{ marginTop: 12, display: "grid", gap: 10 }}>
                  {(variants[p.id] ?? []).map(v => (
                    <li key={v.id} style={{
                      display: "grid", gridTemplateColumns: "1fr auto auto", gap: 10, alignItems: "center"
                    }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{v.label}</div>
                        <div style={{ color: "#666" }}>
                          {v.days_per_week} jours • {v.meals_per_day} repas/jour
                        </div>
                      </div>
                      <div style={{ minWidth: 120, textAlign: "right", fontWeight: 700 }}>
                        {v.weekly_base_price_mad ?? "—"} MAD/sem
                      </div>
                      <Link href={`/subscribe/${v.id}`} style={{
                        padding: "8px 12px", border: "1px solid #ccc", borderRadius: 10, textDecoration: "none"
                      }}>
                        S’abonner
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
