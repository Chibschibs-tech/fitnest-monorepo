"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-browser";

type Row = {
  id: number; // deliveries.id = serial
  subscription_id: number; // int -> subscriptions.id
  delivery_date: string; // timestamptz
  window: string | null;
  address_line1: string | null;
  city: string | null;
  status: "pending" | "preparing" | "out_for_delivery" | "delivered" | "failed";
  subscriptions?: {
    plan_variants?: {
      label: string;
      meal_plans?: { title: string } | null;
    } | null;
  } | null;
};

export default function AdminDeliveriesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from("deliveries")
      .select(`
        id, subscription_id, delivery_date, window, address_line1, city, status,
        subscriptions:subscription_id (
          plan_variants:plan_variant_id (
            label,
            meal_plans:meal_plan_id ( title )
          )
        )
      `)
      .gte("delivery_date", today)
      .order("delivery_date", { ascending: true })
      .order("id", { ascending: true });

    if (!error) setRows((data ?? []) as Row[]);
    else alert(error.message);
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
        <Link href="/subscriptions">Abonnements</Link>
        <Link href="/deliveries"><strong>Livraisons</strong></Link>
      </nav>

      <h1>Livraisons à venir</h1>
      {loading ? (
        <p>Chargement…</p>
      ) : rows.length === 0 ? (
        <p>Aucune livraison à venir.</p>
      ) : (
        <table style={{ borderCollapse: "collapse", minWidth: 920 }}>
          <thead>
            <tr>
              <th style={th}>Date</th>
              <th style={th}>Créneau</th>
              <th style={th}>Adresse</th>
              <th style={th}>Ville</th>
              <th style={th}>Statut</th>
              <th style={th}>Abonnement</th>
              <th style={th}>Plan / Variante</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td style={td}>{new Date(r.delivery_date).toLocaleDateString()}</td>
                <td style={td}>{r.window ?? "—"}</td>
                <td style={td}>{r.address_line1 ?? "—"}</td>
                <td style={td}>{r.city ?? "—"}</td>
                <td style={td}>{r.status}</td>
                <td style={td}>{r.subscription_id}</td>
                <td style={td}>
                  <div style={{ fontWeight: 600 }}>
                    {r.subscriptions?.plan_variants?.meal_plans?.title ?? "—"}
                  </div>
                  <div style={{ color: "#666" }}>
                    {r.subscriptions?.plan_variants?.label ?? "—"}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

const th: React.CSSProperties = { textAlign: "left", borderBottom: "1px solid #ccc", padding: "8px 6px" };
const td: React.CSSProperties = { borderBottom: "1px solid #eee", padding: "8px 6px", verticalAlign: "top" };
