"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";

type Meal = {
  id: number;
  slug: string;
  title: string;
  kcal: number | null;
  image_url: string | null;
};

export default function MealsGallery() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("meals")
        .select("id, slug, title, kcal, image_url")
        .order("title");
      if (!error) setMeals((data ?? []) as Meal[]);
      setLoading(false);
    })();
  }, []);

  return (
    <main>
      <h1 style={{ marginBottom: 12 }}>Repas</h1>
      {loading ? <p>Chargement…</p> : meals.length === 0 ? <p>Aucun repas.</p> : (
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          {meals.map(m => (
            <div key={m.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 10 }}>
              <div style={{
                width: "100%", height: 140, borderRadius: 8, background: "#f6f6f6",
                overflow: "hidden", marginBottom: 8
              }}>
                {m.image_url ? (
                  <img src={m.image_url} alt={m.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : null}
              </div>
              <div style={{ fontWeight: 700 }}>{m.title}</div>
              <div style={{ color: "#666", fontSize: 13 }}>
                {m.kcal ? `${m.kcal} kcal` : "—"}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
