"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

export default function OrderPage() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [byPlan, setByPlan] = useState<Record<string, Variant[]>>({});

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [pRes, vRes] = await Promise.all([
        supabase.from("meal_plans").select("id,title,slug,audience").order("title"),
        supabase
          .from("plan_variants")
          .select("id, meal_plan_id, label, days_per_week, meals_per_day, weekly_base_price_mad, published")
          .eq("published", true)
          .order("meal_plan_id"),
      ]);

      if (!pRes.error) setPlans((pRes.data ?? []) as Plan[]);
      if (!vRes.error) {
        const map: Record<string, Variant[]> = {};
        (vRes.data ?? []).forEach((v: any) => {
          const key = v.meal_plan_id as string;
          map[key] ??= [];
          map[key].push(v as Variant);
        });
        setByPlan(map);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <main>
      {/* HERO */}
      <section
        style={{
          borderRadius: 16,
          padding: "24px 20px",
          background: "linear-gradient(135deg,#e9f7ef,#f1f5f9)",
          border: "1px solid #e5e7eb",
          display: "grid",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "#16a34a",
              display: "inline-block",
            }}
          />
          <h1 style={{ margin: 0 }}>Mangez sain, sans prise de tête</h1>
        </div>
        <p style={{ marginTop: 0, color: "#475569" }}>
          Choisissez votre formule et personnalisez vos jours de livraison. Flexible, simple, délicieux.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a
            href="#plans"
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              background: "#16a34a",
              color: "white",
              textDecoration: "none",
            }}
          >
            Découvrir les formules →
          </a>
          <Link
            href="/meals"
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #cbd5e1",
              textDecoration: "none",
              color: "#111827",
              background: "white",
            }}
          >
            Voir les repas
          </Link>
        </div>
      </section>

      {/* AVANTAGES */}
      <section
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(3, minmax(220px, 1fr))",
          marginTop: 18,
        }}
      >
        {[
          { title: "Flexible", text: "Sélection libre des jours, selon votre rythme." },
          { title: "Équilibré", text: "Des recettes pensées par des pros." },
          { title: "Sans engagement", text: "Pause / annulation à tout moment." },
        ].map((b, i) => (
          <div
            key={i}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 16,
              background: "white",
            }}
          >
            <div style={{ fontWeight: 700 }}>{b.title}</div>
            <div style={{ color: "#64748b", marginTop: 6 }}>{b.text}</div>
          </div>
        ))}
      </section>

      {/* PLANS */}
      <section id="plans" style={{ marginTop: 24 }}>
        <h2 style={{ marginBottom: 10 }}>Nos formules</h2>
        {loading ? (
          <p>Chargement…</p>
        ) : plans.length === 0 ? (
          <p>Aucune formule pour l’instant.</p>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {plans.map((p) => (
              <div
                key={p.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: 16,
                  background: "white",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <h3 style={{ margin: "0 0 4px 0" }}>{p.title}</h3>
                    <div style={{ color: "#64748b" }}>Audience : {p.audience}</div>
                  </div>
                  <Link
                    href={`/plans/${p.id}`}
                    style={{ alignSelf: "start", fontSize: 14, color: "#0ea5e9" }}
                  >
                    Gérer variantes (admin) →
                  </Link>
                </div>

                {(byPlan[p.id] ?? []).length === 0 ? (
                  <p style={{ marginTop: 12, color: "#64748b" }}>Aucune variante publiée.</p>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, minmax(240px, 1fr))",
                      gap: 12,
                      marginTop: 12,
                    }}
                  >
                    {(byPlan[p.id] ?? []).map((v) => (
                      <div
                        key={v.id}
                        style={{
                          border: "1px solid #e5e7eb",
                          borderRadius: 12,
                          padding: 14,
                          background: "#f8fafc",
                          display: "grid",
                          gap: 8,
                        }}
                      >
                        <div style={{ fontWeight: 600 }}>{v.label}</div>
                        <div style={{ color: "#64748b" }}>
                          {v.days_per_week} jours • {v.meals_per_day} repas/jour
                        </div>
                        <div style={{ fontWeight: 700 }}>
                          {v.weekly_base_price_mad ?? "—"} MAD / semaine
                        </div>
                        <Link
                          href={`/subscribe/${v.id}`}
                          style={{
                            marginTop: 4,
                            padding: "10px 12px",
                            borderRadius: 10,
                            background: "#16a34a",
                            color: "white",
                            textDecoration: "none",
                            textAlign: "center",
                          }}
                        >
                          S’abonner →
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FAQ light */}
      <section style={{ marginTop: 28 }}>
        <h2 style={{ marginBottom: 10 }}>FAQ</h2>
        <details style={detailsStyle}>
          <summary style={summaryStyle}>Puis-je choisir mes jours librement ?</summary>
          <div style={answerStyle}>
            Oui. Vous choisissez les jours de livraison à l’abonnement, puis vous pouvez les ajuster dans votre compte.
          </div>
        </details>
        <details style={detailsStyle}>
          <summary style={summaryStyle}>Puis-je mettre en pause ?</summary>
          <div style={answerStyle}>
            Oui, depuis la page Mon compte (pause/reprise/annulation).
          </div>
        </details>
      </section>
    </main>
  );
}

const detailsStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 12,
  background: "white",
  marginBottom: 8,
};
const summaryStyle: React.CSSProperties = { cursor: "pointer", fontWeight: 600 };
const answerStyle: React.CSSProperties = { color: "#475569", marginTop: 8 };
