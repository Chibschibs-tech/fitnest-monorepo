"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";

type Delivery = {
  id: number;
  delivery_date: string;
  status: string;
};

type Meal = {
  id: number;          // meals.id = integer dans ton schéma
  title: string;
  kcal: number | null;
  image_url: string | null;
};

type DeliveryItem = {
  id: number;
  delivery_id: number;
  meal_id: number;
};

export default function MenuBySubscriptionPage() {
  const { subscriptionId } = useParams<{ subscriptionId: string }>();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [initial, setInitial] = useState<Record<number, number[]>>({}); // deliveryId -> mealIds
  const [selection, setSelection] = useState<Record<number, number[]>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);

      // 1) livraisons
      const { data: dData, error: dErr } = await supabase
        .from("deliveries")
        .select("id, delivery_date, status")
        .eq("subscription_id", subscriptionId)
        .order("delivery_date", { ascending: true });

      if (dErr) {
        alert("Erreur chargement livraisons : " + dErr.message);
        setLoading(false);
        return;
      }
      const ds = (dData ?? []) as Delivery[];
      setDeliveries(ds);

      // 2) repas (limite raisonnable pour la démo)
      const { data: mData, error: mErr } = await supabase
        .from("meals")
        .select("id, title, kcal, image_url")
        .order("title")
        .limit(50);

      if (mErr) {
        alert("Erreur chargement repas : " + mErr.message);
        setLoading(false);
        return;
      }
      setMeals((mData ?? []) as Meal[]);

      // 3) items existants pour pré-cocher
      if (ds.length) {
        const ids = ds.map((d) => d.id);
        const { data: itData, error: itErr } = await supabase
          .from("delivery_items")
          .select("delivery_id, meal_id")
          .in("delivery_id", ids);

        if (itErr) {
          alert("Erreur chargement items : " + itErr.message);
          setLoading(false);
          return;
        }
        const map: Record<number, number[]> = {};
        (itData as DeliveryItem[] ?? []).forEach((row) => {
          map[row.delivery_id] ??= [];
          if (!map[row.delivery_id].includes(row.meal_id)) {
            map[row.delivery_id].push(row.meal_id);
          }
        });
        setInitial(map);
        setSelection(map);
      } else {
        setInitial({});
        setSelection({});
      }

      setLoading(false);
    })();
  }, [subscriptionId]);

  const mealById = useMemo(() => {
    const m = new Map<number, Meal>();
    meals.forEach((x) => m.set(x.id, x));
    return m;
  }, [meals]);

  function toggleMeal(deliveryId: number, mealId: number) {
    setSelection((prev) => {
      const cur = prev[deliveryId] ?? [];
      const next = cur.includes(mealId) ? cur.filter((id) => id !== mealId) : [...cur, mealId];
      return { ...prev, [deliveryId]: next };
    });
  }

  async function saveAll() {
    setSaving(true);
    try {
      // pour chaque livraison : on supprime les anciens items puis on insère la sélection courante
      for (const d of deliveries) {
        const choose = selection[d.id] ?? [];

        // delete all items of this delivery
        const { error: delErr } = await supabase
          .from("delivery_items")
          .delete()
          .eq("delivery_id", d.id);

        if (delErr) {
          alert(`Erreur (delete items) livraison #${d.id}: ${delErr.message}`);
          continue;
        }

        if (choose.length) {
          const rows = choose.map((mealId) => ({ delivery_id: d.id, meal_id: mealId }));
          const { error: insErr } = await supabase.from("delivery_items").insert(rows);
          if (insErr) {
            alert(`Erreur (insert items) livraison #${d.id}: ${insErr.message}`);
          }
        }
      }

      setInitial(selection);
      alert("Menus enregistrés ✅");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Chargement…</p>;

  return (
    <>
      <nav style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <Link href="/">Dashboard</Link>
        <Link href="/account">Mon compte</Link>
      </nav>

      <h1 style={{ marginBottom: 6 }}>Composer mon menu par période</h1>
      <p style={{ color: "#666", marginTop: 0 }}>
        Sélectionnez vos repas pour chaque livraison de votre abonnement.
      </p>

      {deliveries.length === 0 ? (
        <p>Aucune livraison associée.</p>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {deliveries.map((d) => (
            <section key={d.id} style={{ border: "1px solid #eee", borderRadius: 14, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <h3 style={{ margin: 0 }}>
                  Livraison du {new Date(d.delivery_date).toLocaleDateString()}
                </h3>
                <span style={{ color: "#6b7280" }}>{d.status}</span>
              </div>

              <div style={{
                display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 12, marginTop: 12
              }}>
                {meals.map((m) => {
                  const selected = (selection[d.id] ?? []).includes(m.id);
                  return (
                    <button
                      key={m.id}
                      onClick={() => toggleMeal(d.id, m.id)}
                      style={{
                        textAlign: "left",
                        border: selected ? "2px solid #16a34a" : "1px solid #e5e7eb",
                        background: "white",
                        borderRadius: 12,
                        overflow: "hidden",
                        cursor: "pointer",
                        padding: 0
                      }}
                    >
                      <div style={{
                        width: "100%", height: 120, background: "#f5f5f5",
                        backgroundImage: m.image_url ? `url(${m.image_url})` : undefined,
                        backgroundSize: "cover", backgroundPosition: "center"
                      }} />
                      <div style={{ padding: 10 }}>
                        <div style={{ fontWeight: 700 }}>{m.title}</div>
                        <div style={{ color: "#6b7280", fontSize: 12 }}>
                          {m.kcal ? `${m.kcal} kcal` : "— kcal"}
                        </div>
                        {selected && <div style={{ marginTop: 6, fontSize: 12, color: "#16a34a" }}>Sélectionné ✓</div>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {deliveries.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <button
            onClick={saveAll}
            disabled={saving}
            style={{
              padding: "10px 16px", background: "#16a34a", color: "white",
              border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer"
            }}
          >
            {saving ? "Enregistrement…" : "Enregistrer tous mes choix"}
          </button>
        </div>
      )}
    </>
  );
}
