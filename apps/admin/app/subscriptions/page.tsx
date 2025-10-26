"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-browser";

// ---------- Types ----------
type DurationCode = "1w" | "2w" | "1m" | null;

type SubRow = {
  id: number;
  user_id: string;
  status: "pending" | "active" | "paused" | "canceled" | "expired";
  starts_at: string | null;
  amount_subtotal_mad: number | null;
  amount_discount_mad: number | null;
  amount_total_mad: number | null;
  duration_code: DurationCode;
  selected_days: unknown; // Supabase returns JSON as unknown
  promo_code: string | null;
  plan_variants: {
    id: string;
    label: string;
    meal_plans?: { title: string } | null;
  } | null;
};

// ---------- Helpers ----------
function durationLabel(d: DurationCode) {
  if (d === "1w") return "1 sem.";
  if (d === "2w") return "2 sem.";
  if (d === "1m") return "1 mois";
  return "—";
}

function safeFixed(n: number | null | undefined) {
  return typeof n === "number" ? n.toFixed(2) : "0.00";
}

const th: React.CSSProperties = {
  textAlign: "left",
  borderBottom: "1px solid #ccc",
  padding: "8px 6px",
};

const td: React.CSSProperties = {
  borderBottom: "1px solid #eee",
  padding: "8px 6px",
  verticalAlign: "top",
};

// ---------- Component ----------
export default function AdminSubscriptionsPage() {
  const [rows, setRows] = useState<SubRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("subscriptions")
      .select(`
        id, user_id, status, starts_at,
        amount_subtotal_mad, amount_discount_mad, amount_total_mad,
        duration_code, selected_days, promo_code,
        plan_variants:plan_variant_id (
          id, label,
          meal_plans:meal_plan_id ( title )
        )
      `)
      .order("id", { ascending: false });

    if (error) {
      alert(error.message);
      setRows([]);
    } else {
      setRows((data ?? []) as unknown as SubRow[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <nav style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <Link href="/admin">Dashboard</Link>
        <Link href="/plans">Plans</Link>
        <Link href="/subscriptions">
          <strong>Abonnements</strong>
        </Link>
        <Link href="/deliveries">Livraisons</Link>
      </nav>

      <h1>Abonnements</h1>

      {loading ? (
        <p>Chargement…</p>
      ) : rows.length === 0 ? (
        <p>Aucun abonnement.</p>
      ) : (
        <table style={{ borderCollapse: "collapse", minWidth: 980 }}>
          <thead>
            <tr>
              <th style={th}>ID</th>
              <th style={th}>Plan / Variante</th>
              <th style={th}>Client (user_id)</th>
              <th style={th}>Durée</th>
              <th style={th}>Jours</th>
              <th style={th}>Sous-total</th>
              <th style={th}>Remise</th>
              <th style={th}>Total</th>
              <th style={th}>Début</th>
              <th style={th}>Statut</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const selectedDaysCount = Array.isArray(r.selected_days)
                ? r.selected_days.length
                : 0;

              return (
                <tr key={r.id}>
                  <td style={td}>{r.id}</td>
                  <td style={td}>
                    <div style={{ fontWeight: 600 }}>
                      {r.plan_variants?.meal_plans?.title ?? "—"}
                    </div>
                    <div style={{ color: "#666" }}>
                      {r.plan_variants?.label ?? "—"}
                    </div>
                  </td>
                  <td style={td}>
                    <code>{r.user_id}</code>
                  </td>
                  <td style={td}>{durationLabel(r.duration_code)}</td>
                  <td style={td}>{selectedDaysCount}</td>
                  <td style={td}>{safeFixed(r.amount_subtotal_mad)} MAD</td>
                  <td style={td}>{safeFixed(r.amount_discount_mad)} MAD</td>
                  <td style={{ ...td, fontWeight: 700 }}>
                    {safeFixed(r.amount_total_mad)} MAD
                  </td>
                  <td style={td}>
                    {r.starts_at
                      ? new Date(r.starts_at).toLocaleDateString()
                      : "—"}
                  </td>
                  <td style={td}>{r.status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </main>
  );
}
