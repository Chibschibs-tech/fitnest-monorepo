"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";
import { computePrice, DurationKey } from "@/lib/pricing";

/**
 * Variant row
 */
type Variant = {
  id: string; // UUID
  label: string;
  days_per_week: number;
  meals_per_day: number;
  weekly_base_price_mad: number | null;
  meal_plans?: { title: string; slug: string } | null;
};

/**
 * What we persist in DB (short codes)
 *  W1 = 1 week, W2 = 2 weeks, M1 = 1 month
 */
type DurationCode = "W1" | "W2" | "M1";

/**
 * UI meta: label, period length (days), min days to select
 */
const DURATION_META: Record<
  DurationCode,
  { label: string; periodDays: number; minRequired: number }
> = {
  W1: { label: "1 semaine", periodDays: 7, minRequired: 3 },
  W2: { label: "2 semaines", periodDays: 14, minRequired: 6 },
  M1: { label: "1 mois", periodDays: 30, minRequired: 10 },
};

/**
 * Map DB codes -> pricing library keys
 * pricing.ts expects "1w" | "2w" | "1m"
 */
const DURATION_TO_PRICING: Record<DurationCode, DurationKey> = {
  W1: "1w",
  W2: "2w",
  M1: "1m",
};

/* ----------------- small date helpers ----------------- */
function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function toISODate(d: Date) {
  return startOfDay(d).toISOString().slice(0, 10);
}
function addDays(base: Date, n: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}
function isPast(dateStr: string) {
  return startOfDay(new Date(dateStr)) < startOfDay(new Date());
}

/* ====================================================== */

export default function SubscribePage() {
  const { variantId } = useParams<{ variantId: string }>();
  const router = useRouter();

  const [variant, setVariant] = useState<Variant | null>(null);
  const [loading, setLoading] = useState(true);

  // Form fields
  const [duration, setDuration] = useState<DurationCode>("W1");
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1); // tomorrow
    return toISODate(d);
  });
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [windowSlot, setWindowSlot] = useState("matin");
  const [promo, setPromo] = useState("");
  const [saving, setSaving] = useState(false);

  // Load variant & ensure auth
  useEffect(() => {
    (async () => {
      setLoading(true);

      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        alert("Veuillez vous connecter pour vous abonner.");
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("plan_variants")
        .select(
          `
          id, label, days_per_week, meals_per_day, weekly_base_price_mad,
          meal_plans:meal_plan_id ( title, slug )
        `
        )
        .eq("id", variantId)
        .single();

      if (error) {
        alert(`Erreur chargement variante: ${error.message}`);
        setLoading(false);
        return;
      }

      setVariant(data as unknown as Variant);
      setLoading(false);
    })();
  }, [variantId, router]);

  // Calendar period from start date
  const calendarDays = useMemo(() => {
    const meta = DURATION_META[duration];
    const start = startOfDay(new Date(startDate));
    const minStart = startOfDay(new Date());
    if (start <= minStart) {
      const tmr = addDays(minStart, 1);
      setStartDate(toISODate(tmr));
      return [];
    }
    return Array.from({ length: meta.periodDays }, (_, i) => toISODate(addDays(start, i)));
  }, [duration, startDate]);

  function toggleDate(dateStr: string) {
    if (isPast(dateStr)) return;
    setSelectedDates((prev) =>
      prev.includes(dateStr) ? prev.filter((d) => d !== dateStr) : [...prev, dateStr]
    );
  }

  // Pricing
  const pricing = useMemo(() => {
    const weeklyBase = variant?.weekly_base_price_mad ?? 0;
    return computePrice(
      {
        weeklyBaseMAD: weeklyBase,
        duration: DURATION_TO_PRICING[duration],
        selectedDays: selectedDates.length,
      },
      { promoCode: promo || undefined }
    );
  }, [variant?.weekly_base_price_mad, duration, selectedDates.length, promo]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!variant) return;

    const minRequired = DURATION_META[duration].minRequired;
    if (selectedDates.length < minRequired) {
      alert(
        `Veuillez sélectionner au moins ${minRequired} jour(s) de livraison pour ${DURATION_META[duration].label}.`
      );
      return;
    }
    if (!address || !city) {
      alert("Adresse et ville sont requises.");
      return;
    }

    setSaving(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) {
        alert("Session expirée. Merci de vous reconnecter.");
        router.push("/login");
        return;
      }

      // subscription row
      const startsAt = new Date(startDate);
      const renewsAt = new Date(selectedDates[selectedDates.length - 1]);

      const { data: sub, error: subErr } = await supabase
        .from("subscriptions")
        .insert([
          {
            user_id: user.id,
            plan_variant_id: variant.id,
            status: "active",
            starts_at: startsAt.toISOString(),
            renews_at: renewsAt.toISOString(),

            amount_subtotal_mad: pricing.subtotal,
            amount_discount_mad: pricing.discounts.reduce((s, d) => s + d.amount, 0),
            amount_total_mad: pricing.total,

            duration_code: duration,            // "W1" | "W2" | "M1"
            selected_days: selectedDates,       // text[] column
            promo_code: promo || null,
            pricing_version: 1,

            notes: [
              `Créneau: ${windowSlot}`,
              variant.weekly_base_price_mad != null
                ? `Base: ${variant.weekly_base_price_mad} MAD/sem`
                : "",
            ]
              .filter(Boolean)
              .join(" • "),
          } as any,
        ])
        .select("id")
        .single();

      if (subErr) {
        alert(`Erreur création abonnement: ${subErr.message}`);
        setSaving(false);
        return;
      }

      // deliveries for each chosen date
      const deliveries = selectedDates.map((dateStr) => ({
        subscription_id: sub.id,
        delivery_date: new Date(dateStr).toISOString(),
        window: windowSlot,
        address_line1: address,
        city,
        status: "pending",
      }));
      const { error: delErr } = await supabase.from("deliveries").insert(deliveries);

      if (delErr) {
        alert(`Abonnement créé, mais erreur livraisons: ${delErr.message}`);
      } else {
        alert("Abonnement créé ✅");
      }

      router.push("/merci"); // or "/deliveries" if you prefer
    } finally {
      setSaving(false);
    }
  }

  if (loading || !variant) {
    return (
      <main style={{ padding: 24 }}>
        <nav style={{ display: "flex", gap: 16, marginBottom: 24 }}>
          <Link href="/">Dashboard</Link>
          <Link href="/catalogue">Catalogue</Link>
        </nav>
        <p>Chargement…</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <nav style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <Link href="/">Dashboard</Link>
        <Link href="/catalogue">Catalogue</Link>
      </nav>

      <h1>S’abonner</h1>
      <p style={{ color: "#555", marginBottom: 8 }}>
        Plan <strong>{variant.meal_plans?.title}</strong> — variante{" "}
        <strong>{variant.label}</strong> • {variant.days_per_week} jours ×{" "}
        {variant.meals_per_day} repas/jour
      </p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 16, maxWidth: 820 }}>
        {/* Duration */}
        <div>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
            Durée d’abonnement
          </label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(Object.keys(DURATION_META) as DurationCode[]).map((code) => {
              const meta = DURATION_META[code];
              const active = duration === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    setDuration(code);
                    setSelectedDates([]);
                  }}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: active ? "2px solid #333" : "1px solid #ccc",
                    background: active ? "#f8f8f8" : "white",
                    cursor: "pointer",
                  }}
                >
                  {meta.label} • min {meta.minRequired} jours
                </button>
              );
            })}
          </div>
        </div>

        {/* Start date */}
        <label>
          Date de début
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setSelectedDates([]);
            }}
            required
          />
        </label>

        {/* Calendar */}
        <div>
          <div style={{ marginBottom: 8, fontWeight: 600 }}>Choisissez vos jours</div>
          <p style={{ margin: "4px 0", color: "#666" }}>
            Minimum requis: <strong>{DURATION_META[duration].minRequired}</strong> jours • Vous
            pouvez répartir librement vos jours dans la période
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, minmax(110px, 1fr))",
              gap: 8,
              alignItems: "stretch",
            }}
          >
            {calendarDays.map((d) => {
              const disabled = isPast(d);
              const active = selectedDates.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDate(d)}
                  disabled={disabled}
                  style={{
                    padding: "10px 8px",
                    borderRadius: 8,
                    border: active ? "2px solid #1a7f37" : "1px solid #ccc",
                    background: disabled ? "#f3f3f3" : active ? "#e9f7ef" : "white",
                    color: disabled ? "#999" : "inherit",
                    cursor: disabled ? "not-allowed" : "pointer",
                    textAlign: "left",
                  }}
                  title={disabled ? "Date indisponible" : "Sélectionner"}
                >
                  <div style={{ fontWeight: 600 }}>
                    {new Date(d).toLocaleDateString()}
                  </div>
                  {!disabled && (
                    <div style={{ fontSize: 12, color: "#666" }}>
                      {active ? "Sélectionné" : "Disponible"}
                    </div>
                  )}
                  {disabled && <div style={{ fontSize: 12 }}>Indisponible</div>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Address / Window / Promo */}
        <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr 1fr" }}>
          <label style={{ gridColumn: "1 / 3" }}>
            Adresse
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Adresse de livraison"
              required
            />
          </label>
          <label>
            Ville
            <input value={city} onChange={(e) => setCity(e.target.value)} required />
          </label>
          <label>
            Créneau
            <select value={windowSlot} onChange={(e) => setWindowSlot(e.target.value)}>
              <option value="matin">Matin</option>
              <option value="midi">Midi</option>
              <option value="soir">Soir</option>
            </select>
          </label>
          <label>
            Code promo (optionnel)
            <input
              value={promo}
              onChange={(e) => setPromo(e.target.value)}
              placeholder="FIT-10..."
            />
          </label>
        </div>

        {/* Pricing Summary */}
        <div
          style={{
            border: "1px solid #eee",
            borderRadius: 12,
            padding: 12,
            display: "grid",
            gridTemplateColumns: "1fr 220px",
            gap: 12,
            alignItems: "start",
          }}
        >
          <div>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Récapitulatif</div>
            <div style={{ color: "#666" }}>
              {selectedDates.length} jour(s) sélectionné(s) • Durée: {DURATION_META[duration].label}
            </div>
            <ul style={{ marginTop: 8 }}>
              {pricing.breakdown.map((b, i) => (
                <li key={i}>
                  {b.label}: <strong>{b.amount} MAD</strong>
                </li>
              ))}
            </ul>
            {pricing.discounts.length > 0 && (
              <>
                <div style={{ marginTop: 8, fontWeight: 600 }}>Remises</div>
                <ul>
                  {pricing.discounts.map((d, i) => (
                    <li key={i}>
                      {d.label}:{" "}
                      <strong style={{ color: "#1a7f37" }}>{d.amount} MAD</strong>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#666", fontSize: 12 }}>Total</div>
            <div style={{ fontWeight: 800, fontSize: 24 }}>{pricing.total} MAD</div>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <button disabled={saving} type="submit">
            {saving ? "Validation…" : "Confirmer l’abonnement"}
          </button>
        </div>
      </form>
    </main>
  );
}
