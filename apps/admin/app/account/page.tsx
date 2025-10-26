"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  status: "active" | "paused" | "canceled" | "expired" | string;
  starts_at: string;
  renews_at: string | null;
  notes: string | null;
  duration_code?: "W1" | "W2" | "M1" | null;
  selected_days?: string[] | null;
  amount_subtotal_mad?: number | null;
  amount_discount_mad?: number | null;
  amount_total_mad?: number | null;
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

const th: React.CSSProperties = { textAlign: "left", borderBottom: "1px solid #ccc", padding: "8px 6px" };
const td: React.CSSProperties = { borderBottom: "1px solid #eee", padding: "8px 6px" };

const DAYS: { code: string; label: string }[] = [
  { code: "mon", label: "Lun" },
  { code: "tue", label: "Mar" },
  { code: "wed", label: "Mer" },
  { code: "thu", label: "Jeu" },
  { code: "fri", label: "Ven" },
  { code: "sat", label: "Sam" },
  { code: "sun", label: "Dim" },
];

const MIN_REQUIRED: Record<NonNullable<Subscription["duration_code"]>, number> = {
  W1: 3,
  W2: 6,
  M1: 10,
};

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString();
}
function toISODateInput(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function AccountPage() {
  const router = useRouter();

  // petit helper pour “recharger” l’écran
  function bootstrap() {
    router.refresh();
  }

  const [loading, setLoading] = useState(true);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [saving, setSaving] = useState(false);

  // replanification
  const [editId, setEditId] = useState<number | null>(null);
  const [editDate, setEditDate] = useState<string>("");

  // préférences récurrentes
  const activeSub = useMemo(
    () => subs.find((s) => s.status === "active") ?? subs[0] ?? null,
    [subs]
  );
  const [daysSel, setDaysSel] = useState<string[]>([]);
  const minRequired = useMemo(() => {
    const code = activeSub?.duration_code ?? null;
    return code ? MIN_REQUIRED[code] ?? 0 : 0;
  }, [activeSub?.duration_code]);

  useEffect(() => {
    (async () => {
      setLoading(true);

      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        alert("Veuillez vous connecter.");
        router.push("/login");
        return;
      }

      // Abonnements de l’utilisateur
      const { data: sData, error: sErr } = await supabase
        .from("subscriptions")
        .select(`
          id, user_id, plan_variant_id, status, starts_at, renews_at, notes,
          duration_code, selected_days, amount_subtotal_mad, amount_discount_mad, amount_total_mad,
          plan_variants:plan_variant_id (
            id, label, days_per_week, meals_per_day,
            meal_plans:meal_plan_id ( title, slug )
          )
        `)
        .eq("user_id", auth.user.id)
        .order("id", { ascending: false });

      if (sErr) {
        alert(`Erreur chargement abonnements: ${sErr.message}`);
        setLoading(false);
        return;
      }

      const subsCast = (sData as unknown as Subscription[]) ?? [];
      setSubs(subsCast);

      // Livraisons à venir (60 jours)
      const subIds = subsCast.map((r) => r.id);
      if (subIds.length) {
        const today = new Date();
        const horizon = new Date();
        horizon.setDate(today.getDate() + 60);

        const { data: dData, error: dErr } = await supabase
          .from("deliveries")
          .select("id, subscription_id, delivery_date, window, address_line1, city, status")
          .in("subscription_id", subIds)
          .gte("delivery_date", today.toISOString())
          .lte("delivery_date", horizon.toISOString())
          .order("delivery_date", { ascending: true });

        if (dErr) {
          alert(`Erreur chargement livraisons: ${dErr.message}`);
          setLoading(false);
          return;
        }
        setDeliveries((dData as Delivery[]) ?? []);
      } else {
        setDeliveries([]);
      }

      setLoading(false);
    })();
  }, [router]);

  useEffect(() => {
    if (activeSub?.selected_days) setDaysSel(activeSub.selected_days);
    else setDaysSel([]);
  }, [activeSub?.id, activeSub?.selected_days]);

  async function updateSubStatus(id: number, status: "active" | "paused" | "canceled") {
    setSaving(true);
    try {
      const { error } = await supabase.from("subscriptions").update({ status }).eq("id", id);
      if (error) return alert(error.message);
      setSubs((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    } finally {
      setSaving(false);
    }
  }

  async function skipDelivery(id: number) {
    if (!confirm("Confirmer le report/skip de cette livraison ?")) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("deliveries").update({ status: "skipped" }).eq("id", id);
      if (error) return alert(error.message);
      setDeliveries((prev) => prev.map((d) => (d.id === id ? { ...d, status: "skipped" } : d)));
    } finally {
      setSaving(false);
    }
  }

  async function pauseSub(id: number) {
    setSaving(true);
    try {
      const { error } = await supabase.rpc("pause_subscription", { p_sub_id: id });
      if (error) return alert(`Pause error: ${error.message}`);
      await bootstrap();
    } finally {
      setSaving(false);
    }
  }

  async function resumeSub(id: number) {
    setSaving(true);
    try {
      const { error } = await supabase.rpc("resume_subscription", { p_sub_id: id });
      if (error) return alert(`Resume error: ${error.message}`);
      await bootstrap();
    } finally {
      setSaving(false);
    }
  }

  async function cancelSub(id: number) {
    if (!confirm("Annuler l’abonnement ?")) return;
    setSaving(true);
    try {
      const { error } = await supabase.rpc("cancel_subscription", { p_sub_id: id });
      if (error) return alert(`Cancel error: ${error.message}`);
      await bootstrap();
    } finally {
      setSaving(false);
    }
  }

  function openReschedule(d: Delivery) {
    setEditId(d.id);
    const cur = new Date(d.delivery_date);
    setEditDate(toISODateInput(cur));
  }
  async function saveReschedule() {
    if (editId == null || !editDate) return;
    const chosen = new Date(editDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (chosen < today) {
      alert("Impossible de sélectionner une date passée.");
      return;
    }

    setSaving(true);
    try {
      const iso = new Date(editDate).toISOString();
      const { error } = await supabase.from("deliveries").update({ delivery_date: iso }).eq("id", editId);
      if (error) return alert(error.message);

      setDeliveries((prev) =>
        prev.map((d) => (d.id === editId ? { ...d, delivery_date: iso } : d))
      );
      setEditId(null);
      setEditDate("");
    } finally {
      setSaving(false);
    }
  }

  function toggleDay(code: string) {
    setDaysSel((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  }

  async function saveRecurringDays() {
    if (!activeSub) return;
    const count = daysSel.length;

    if (minRequired && count < minRequired) {
      alert(`Veuillez sélectionner au moins ${minRequired} jours pour cette durée.`);
      return;
    }

    setSaving(true);
    try {
      const { error: uErr } = await supabase
        .from("subscriptions")
        .update({ selected_days: daysSel })
        .eq("id", activeSub.id);

      if (uErr) {
        alert(uErr.message);
        return;
      }

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const { error: rpcErr } = await supabase.rpc("rebuild_future_deliveries", {
        p_subscription_id: activeSub.id,
        p_from_date: toISODateInput(tomorrow),
      });

      if (rpcErr) {
        alert(`Rebuild error: ${rpcErr.message}`);
        return;
      }

      alert("Préférences enregistrées ✅ Les prochaines livraisons ont été mises à jour.");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <nav style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <Link href="/">Dashboard</Link>
        <Link href="/catalogue">Catalogue</Link>
        <Link href="/account"><strong>Mon compte</strong></Link>
      </nav>

      <h1>Mon compte</h1>

      {loading ? (
        <p>Chargement…</p>
      ) : (
        <>
          {/* Abonnements */}
          <section style={{ marginTop: 16 }}>
            <h2 style={{ marginBottom: 8 }}>Mes abonnements</h2>
            {subs.length === 0 ? (
              <p>Aucun abonnement pour le moment.</p>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {subs.map((s) => (
                  <div key={s.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
                    <div style={{ fontWeight: 600 }}>
                      {s.plan_variants?.meal_plans?.title ?? "Plan"} — {s.plan_variants?.label ?? "Variante"}
                    </div>
                    <div style={{ color: "#666", margin: "4px 0" }}>
                      Début: {formatDate(s.starts_at)} • Renouvellement: {formatDate(s.renews_at)} • Statut:{" "}
                      <strong>{s.status}</strong>
                    </div>
                    <div style={{ color: "#666" }}>
                      {s.amount_total_mad != null ? (
                        <>
                          Total: <strong>{s.amount_total_mad.toFixed(2)} MAD</strong>{" "}
                          {s.amount_discount_mad ? (
                            <span style={{ marginLeft: 8 }}>
                              (Remise: {s.amount_discount_mad.toFixed(2)} MAD)
                            </span>
                          ) : null}
                        </>
                      ) : null}
                    </div>

                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      {s.status !== "active" && (
                        <button disabled={saving} onClick={() => updateSubStatus(s.id, "active")}>
                          Reprendre
                        </button>
                      )}
                      {s.status === "active" && (
                        <button disabled={saving} onClick={() => updateSubStatus(s.id, "paused")}>
                          Mettre en pause
                        </button>
                      )}
                      {s.status !== "canceled" && (
                        <button
                          disabled={saving}
                          onClick={() => updateSubStatus(s.id, "canceled")}
                          style={{ color: "#a00" }}
                        >
                          Annuler
                        </button>
                      )}
                    </div>

                    {/* 👇 LIEN BULK (composition en masse par abonnement) */}
                    {s.status === "active" && (
                      <div style={{ marginTop: 8 }}>
                        <Link href={`/menu/bulk/${s.id}`} style={{ textDecoration: "underline" }}>
                          Composer mon menu (en masse) →
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Préférences de jours récurrents */}
          {activeSub && (
            <section style={{ marginTop: 28 }}>
              <h2 style={{ marginBottom: 8 }}>Préférences de jours de livraison</h2>
              <p style={{ color: "#666", marginTop: 0 }}>
                Durée: <strong>{activeSub.duration_code ?? "—"}</strong>{" "}
                {minRequired ? `• Minimum requis: ${minRequired} jours` : ""}
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {DAYS.map((d) => {
                  const checked = daysSel.includes(d.code);
                  return (
                    <label
                      key={d.code}
                      style={{
                        border: "1px solid #ddd",
                        borderRadius: 8,
                        padding: "6px 10px",
                        cursor: "pointer",
                        background: checked ? "#f5f5f5" : "white",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleDay(d.code)}
                        style={{ marginRight: 6 }}
                      />
                      {d.label}
                    </label>
                  );
                })}
              </div>
              <div style={{ marginTop: 12 }}>
                <button disabled={saving} onClick={saveRecurringDays}>
                  {saving ? "Enregistrement…" : "Enregistrer les préférences"}
                </button>
              </div>
            </section>
          )}

          {/* Livraisons à venir */}
          <section style={{ marginTop: 28 }}>
            <h2 style={{ marginBottom: 8 }}>Mes livraisons à venir</h2>
            {deliveries.length === 0 ? (
              <p>Aucune livraison planifiée.</p>
            ) : (
              <table style={{ borderCollapse: "collapse", minWidth: 820 }}>
                <thead>
                  <tr>
                    <th style={th}>Date</th>
                    <th style={th}>Créneau</th>
                    <th style={th}>Adresse</th>
                    <th style={th}>Ville</th>
                    <th style={th}>Statut</th>
                    <th style={th}></th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((d) => (
                    <tr key={d.id}>
                      <td style={td}>{formatDate(d.delivery_date)}</td>
                      <td style={td}>{d.window ?? "—"}</td>
                      <td style={td}>{d.address_line1 ?? "—"}</td>
                      <td style={td}>{d.city ?? "—"}</td>
                      <td style={td}>{d.status}</td>
                      <td style={td}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          {d.status === "pending" ? (
                            <>
                              <button onClick={() => openReschedule(d)} disabled={saving}>
                                Replanifier
                              </button>
                              <button onClick={() => skipDelivery(d.id)} disabled={saving}>
                                Skip
                              </button>

                              {/* 👇 LIEN PAR LIVRAISON (menu de cette date) */}
                              <Link
                                href={`/menu/${d.id}`}
                                style={{ textDecoration: "underline", marginLeft: 8 }}
                              >
                                Composer le menu
                              </Link>
                            </>
                          ) : (
                            <span style={{ color: "#888" }}>—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {editId != null && (
              <div
                style={{
                  marginTop: 12,
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: 12,
                  maxWidth: 420,
                }}
              >
                <h3 style={{ marginTop: 0 }}>Replanifier la livraison</h3>
                <label style={{ display: "block", marginBottom: 8 }}>
                  Nouvelle date
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    style={{ display: "block", marginTop: 4 }}
                  />
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={saveReschedule} disabled={saving || !editDate}>
                    Enregistrer
                  </button>
                  <button
                    onClick={() => {
                      setEditId(null);
                      setEditDate("");
                    }}
                    disabled={saving}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
