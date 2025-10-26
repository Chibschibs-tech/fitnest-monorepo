"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-browser";

type MealPlan = {
  id: string; // uuid
  title: string;
  slug: string;
  audience: "keto" | "lowcarb" | "balanced" | "muscle" | "custom";
};

const AUDIENCES: MealPlan["audience"][] = [
  "keto",
  "lowcarb",
  "balanced",
  "muscle",
  "custom",
];

export default function PlansPage() {
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // form
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [audience, setAudience] =
    useState<MealPlan["audience"]>("balanced");

  async function loadPlans() {
    setLoading(true);
    const { data, error } = await supabase
      .from("meal_plans")
      .select("id,title,slug,audience,created_at")
      .order("created_at", { ascending: true });

    if (error) {
      alert(error.message);
      setPlans([]);
    } else {
      setPlans((data ?? []) as MealPlan[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    void loadPlans();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !slug) {
      alert("Titre et slug requis.");
      return;
    }

    const { error } = await supabase
      .from("meal_plans")
      .insert([{ title, slug, audience }]);

    if (error) {
      alert(`Create error: ${error.message}`);
      return;
    }

    setTitle("");
    setSlug("");
    setAudience("balanced");
    await loadPlans();
  }

  async function onDelete(id: string) {
    if (!confirm("Supprimer ce plan ?")) return;
    const { error } = await supabase
      .from("meal_plans")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }
    await loadPlans();
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

      <h1>Plans</h1>

      <section style={{ marginTop: 24, marginBottom: 40 }}>
        <h2>Créer un plan</h2>
        <form
          onSubmit={onCreate}
          style={{ display: "grid", gap: 8, maxWidth: 420 }}
        >
          <input
            placeholder="Titre"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            placeholder="Slug (unique)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
          <select
            value={audience}
            onChange={(e) =>
              setAudience(e.target.value as MealPlan["audience"])
            }
          >
            {AUDIENCES.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <button type="submit">Créer</button>
        </form>
      </section>

      <section>
        <h2>Existants</h2>
        {loading ? (
          <p>Chargement…</p>
        ) : plans.length === 0 ? (
          <p>Aucun plan.</p>
        ) : (
          <ul>
            {plans.map((p) => (
              <li key={p.id} style={{ margin: "8px 0" }}>
                <strong>{p.title}</strong> • {p.slug} • audience: {p.audience}{" "}
                <button style={{ marginLeft: 8 }} onClick={() => onDelete(p.id)}>
                  Supprimer
                </button>{" "}
                <Link href={`/plans/${p.id}`}>Gérer les variantes →</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
