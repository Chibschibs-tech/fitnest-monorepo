"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";

type CountRow = { count: number };

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [mealsCount, setMealsCount] = useState<number>(0);
  const [plansCount, setPlansCount] = useState<number>(0);
  const [variantsCount, setVariantsCount] = useState<number>(0);
  const [subsCount, setSubsCount] = useState<number>(0);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [m, p, v, s] = await Promise.all([
        supabase.from("meals").select("*", { count: "exact", head: true }),
        supabase.from("meal_plans").select("*", { count: "exact", head: true }),
        supabase.from("plan_variants").select("*", { count: "exact", head: true }),
        supabase.from("subscriptions").select("*", { count: "exact", head: true }),
      ]);

      if (!m.error && m.count != null) setMealsCount(m.count);
      if (!p.error && p.count != null) setPlansCount(p.count);
      if (!v.error && v.count != null) setVariantsCount(v.count);
      if (!s.error && s.count != null) setSubsCount(s.count);

      setLoading(false);
    })();
  }, []);

  return (
    <main style={{ padding: 12 }}>
      <h1 style={{ margin: "8px 0 16px" }}>Dashboard</h1>

      {loading ? (
        <p>Chargement…</p>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(180px, 1fr))",
          gap: 12
        }}>
          <Card title="Repas" value={mealsCount} href="/admin/meals" />
          <Card title="Plans" value={plansCount} href="/admin/plans" />
          <Card title="Variantes" value={variantsCount} href="/admin/plans" />
          <Card title="Abonnements" value={subsCount} href="/admin/subscriptions" />
        </div>
      )}

      <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link className="admin-link" href="/admin/meals">Gérer les repas →</Link>
        <Link className="admin-link" href="/admin/plans">Gérer les plans & variantes →</Link>
        <Link className="admin-link" href="/admin/subscriptions">Gérer les abonnements →</Link>
      </div>

      <style jsx>{`
        .admin-link {
          padding: 10px 14px;
          border-radius: 10px;
          border: 1px solid #223;
          color: #111;
          text-decoration: none;
          background: #0b1226;
          color: #fff;
          border-color: #0b1226;
        }
        .admin-link:hover {
          opacity: 0.9;
        }
      `}</style>
    </main>
  );
}

function Card({ title, value, href }: { title: string; value: number; href: string }) {
  return (
    <a href={href} style={{
      textDecoration: "none",
      border: "1px solid #0b1226",
      borderRadius: 12,
      padding: 14,
      background: "#111827",
      color: "white",
      display: "block"
    }}>
      <div style={{ fontSize: 13, opacity: 0.9 }}>{title}</div>
      <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4 }}>{value}</div>
      <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>Voir →</div>
    </a>
  );
}
