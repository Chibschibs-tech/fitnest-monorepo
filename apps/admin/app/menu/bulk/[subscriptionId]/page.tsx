"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";

type Plan = { title: string; slug: string };
type Variant = {
  id: string; // uuid
  label: string;
  days_per_week: number;
  meals_per_day: number;
  meal_plans?: Plan | null;
};
type Subscription = {
  id: number;
  user_id: string;
  plan_variant_id: string;
  status: string;
  starts_at: string;
  renews_at: string | null;
  notes: string | null;
  plan_variants?: Variant | null;
};
type Delivery = {
  id: number;
  subscription_id: number;
  delivery_date: string;
  window: string | null;
  address_line1: string | null;
  city: string | null;
  status: string;
};
type Meal = { id: number; title: string; slug: string; kcal: number | null; image_url: string | null };

type DraftMap = Record<
  number,                // delivery_id
  { [slotIndex: number]: number | null } // slot -> meal_id
>;

export default function BulkMenuPage() {
  const params = useParams<{ subscriptionId: string }>();
  const subscriptionId = Number(params.subscriptionId);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [saving, setSaving] = useState(false);

  // brouillon local : livraison -> { slotIndex: mealId }
  const [draft, setDraft] = useState<DraftMap>({});
  const [copySource, setCopySource] = useState<number | null>(null); // delivery_id source

  const mealsById = useMemo(() => {
    const m = new Map<number, Meal>();
    meals.forEach(x => m.set(x.id, x));
    return m;
  }, [meals]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      // 1) auth
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        alert("Veuillez vous connecter.");
        router.push("/login");
        return;
      }

      // 2) abonnement
      const { data: sub, error: sErr } = await supabase
        .from("subscriptions")
        .select(`
          id, user_id, plan_variant_id, status, starts_at, renews_at, notes,
          plan_variants:plan_variant_id (
            id, label, days_per_week, meals_per_day,
            meal_plans:meal_plan_id ( title, slug )
          )
        `)
        .eq("id", subscriptionId)
        .single();

      if (sErr) {
        alert(sErr.message);
        setLoading(false);
        return;
      }
      setSubscription(sub as unknown as Subscription);

      // 3) prochaines livraisons "pending" de cet abonnement (30 jours)
      const today = new Date();
      const horizon = new Date();
      horizon.setDate(today.getDate() + 30);

      const { data: dels, error: dErr } = await supabase
        .from("deliveries")
        .select("id, subscription_id, delivery_date, window, address_line1, city, status")
        .eq("subscription_id", subscriptionId)
        .eq("status", "pending")
        .gte("delivery_date", today.toISOString())
        .lte("delivery_date", horizon.toISOString())
        .order("delivery_date");

      if (dErr) {
        alert(dErr.message);
        setLoading(false);
        return;
      }
      setDeliveries((dels as Delivery[]) ?? []);

      // 4) tous les repas (ordonnés)
      const { data: ms, error: mErr } = await supabase
        .from("meals")
        .select("id,title,slug,kcal,image_url")
        .order("title", { ascending: true });

      if (mErr) {
        alert(mErr.message);
        setLoading(false);
        return;
      }
      setMeals((ms as Meal[]) ?? []);

      // 5) charger les choix existants (delivery_items) pour pré-remplir le draft
      //    on récupère pour l’ensemble des deliveries
      const delIds = (dels ?? []).map(d => d.id);
      if (delIds.length > 0) {
        const { data: items, error: iErr } = await supabase
          .from("delivery_items")
          .select("delivery_id, slot_index, meal_id")
          .in("delivery_id", delIds);

        if (!iErr) {
          const tmp: DraftMap = {};
          for (const d of delIds) tmp[d] = {};
          for (const it of (items ?? []) as any[]) {
            tmp[it.delivery_id] ??= {};
            tmp[it.delivery_id][it.slot_index] = it.meal_id;
          }
          setDraft(tmp);
        }
      }

      setLoading(false);
    })();
  }, [subscriptionId, router]);

  function setCell(deliveryId: number, slotIndex: number, mealId: number | null) {
    setDraft(prev => ({
      ...prev,
      [deliveryId]: {
        ...(prev[deliveryId] ?? {}),
        [slotIndex]: mealId
      }
    }));
  }

  function copyFrom(deliveryId: number) {
    setCopySource(deliveryId);
  }

  function pasteTo(targetDeliveryId: number, mealsPerDay: number) {
    if (!copySource || !draft[copySource]) return;
    const source = draft[copySource];
    const next = { ...(draft[targetDeliveryId] ?? {}) };
    for (let s = 0; s < mealsPerDay; s++) {
      next[s] = source[s] ?? null;
    }
    setDraft(prev => ({ ...prev, [targetDeliveryId]: next }));
  }

  async function saveAll() {
    if (!subscription) return;
    if (!subscription.plan_variants) return;

    const mealsPerDay = subscription.plan_variants.meals_per_day;
    const rows: { delivery_id: number; slot_index: number; meal_id: number | null }[] = [];

    for (const d of deliveries) {
      const row = draft[d.id] ?? {};
      for (let s = 0; s < mealsPerDay; s++) {
        const mealId = row[s] ?? null;
        rows.push({ delivery_id: d.id, slot_index: s, meal_id: mealId });
      }
    }

    setSaving(true);
    try {
      // On upsert par (delivery_id, slot_index)
      const { error } = await supabase
        .from("delivery_items")
        .upsert(rows, { onConflict: "delivery_id,slot_index" });
      if (error) return alert(error.message);

      alert("Menus enregistrés ✅");
      router.push("/account");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !subscription) {
    return (
      <main style={{ padding: 24 }}>
        <nav style={{ display: "flex", gap: 16, marginBottom: 24 }}>
          <Link href="/">Dashboard</Link>
          <Link href="/account">Mon compte</Link>
        </nav>
        <p>Chargement…</p>
      </main>
    );
  }

  const variant = subscription.plan_variants!;
  const mealsPerDay = variant.meals_per_day;

  return (
    <main style={{ padding: 24 }}>
      <nav style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <Link href="/">Dashboard</Link>
        <Link href="/account">Mon compte</Link>
      </nav>

      <h1>Composer mon menu (en masse)</h1>
      <p style={{ color: "#666" }}>
        {variant.meal_plans?.title} — {variant.label} • {variant.days_per_week} jours × {variant.meals_per_day} repas/jour
      </p>

      {deliveries.length === 0 ? (
        <p>Aucune livraison “pending” à venir.</p>
      ) : (
        <>
          <div style={{ margin: "12px 0" }}>
            <button disabled={saving} onClick={saveAll}>
              {saving ? "Enregistrement…" : "Enregistrer tous les menus"}
            </button>
          </div>

          <div style={{ display: "grid", gap: 16 }}>
            {deliveries.map((d) => (
              <div key={d.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong>{new Date(d.delivery_date).toLocaleDateString()}</strong>{" "}
                    <span style={{ color: "#666" }}>({d.window ?? "—"})</span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="button" onClick={() => copyFrom(d.id)} title="Copier depuis ce jour">
                      Copier ce jour
                    </button>
                    <button type="button" onClick={() => pasteTo(d.id, mealsPerDay)} title="Coller sur ce jour">
                      Coller sur ce jour
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: 12, display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
                  {Array.from({ length: mealsPerDay }).map((_, s) => {
                    const current = draft[d.id]?.[s] ?? null;
                    return (
                      <div key={s} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 8 }}>
                        <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>Créneau {s + 1}</div>
                        <select
                          value={current ?? ""}
                          onChange={(e) => {
                            const val = e.target.value === "" ? null : Number(e.target.value);
                            setCell(d.id, s, val);
                          }}
                          style={{ width: "100%" }}
                        >
                          <option value="">— Aucun —</option>
                          {meals.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.title} {m.kcal ? `(${m.kcal} kcal)` : ""}
                            </option>
                          ))}
                        </select>

                        {current && mealsById.get(current)?.image_url ? (
                          <img
                            src={mealsById.get(current)!.image_url!}
                            alt={mealsById.get(current)!.title}
                            style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 6, marginTop: 8 }}
                          />
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16 }}>
            <button disabled={saving} onClick={saveAll}>
              {saving ? "Enregistrement…" : "Enregistrer tous les menus"}
            </button>
          </div>
        </>
      )}
    </main>
  );
}
