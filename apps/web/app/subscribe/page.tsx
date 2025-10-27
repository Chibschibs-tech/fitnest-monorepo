"use client";
import { useEffect, useMemo, useState } from "react";

type Meal = "Breakfast" | "Lunch" | "Dinner";

export default function SubscribePage(){
  // Lire le plan depuis l'URL ?plan=Weight%20Loss
  const search = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const urlPlan = useMemo(() => (search?.get("plan") || "Weight Loss"), [search]);

  const [plan, setPlan] = useState(urlPlan);
  const [meals, setMeals] = useState<Meal[]>(["Breakfast","Lunch"]);
  const [days, setDays] = useState(5);
  const [duration, setDuration] = useState(4);
  const [out, setOut] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // si l'URL change (navigations internes), on sync le plan
  useEffect(()=>{ setPlan(urlPlan); }, [urlPlan]);

  function toggle(meal: Meal){
    setMeals(m => m.includes(meal) ? m.filter(x=>x!==meal) : [...m, meal]);
  }

  async function calc(){
    try{
      setLoading(true); setError(null);
      const r = await fetch("/api/calculate-price",{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ plan, meals, days, duration })
      });
      const j = await r.json();
      if(!r.ok){ setError(j.error || "Error"); setOut(null); return; }
      setOut(j);
    } finally { setLoading(false); }
  }

  return (
    <main style={{maxWidth:900, margin:"0 auto", padding:24}}>
      <h1>Subscribe — Configurateur</h1>

      <div style={{display:"grid", gap:12, marginTop:12}}>
        <label>Plan
          <select value={plan} onChange={e=>setPlan(e.target.value)} style={{marginLeft:8}}>
            <option>Weight Loss</option>
            <option>Stay Fit</option>
            <option>Muscle Gain</option>
          </select>
        </label>

        <div style={{display:"flex", gap:12}}>
          <label><input type="checkbox" checked={meals.includes("Breakfast")} onChange={()=>toggle("Breakfast")} /> Breakfast</label>
          <label><input type="checkbox" checked={meals.includes("Lunch")} onChange={()=>toggle("Lunch")} /> Lunch</label>
          <label><input type="checkbox" checked={meals.includes("Dinner")} onChange={()=>toggle("Dinner")} /> Dinner</label>
        </div>

        <div style={{display:"flex", gap:12}}>
          <label>Jours/sem <input type="number" min={1} max={7} value={days} onChange={e=>setDays(Number(e.target.value))} /></label>
          <label>Durée (sem) <input type="number" min={1} value={duration} onChange={e=>setDuration(Number(e.target.value))} /></label>
          <button onClick={calc} disabled={loading}>{loading ? "Calcul..." : "Calculer"}</button>
        </div>
      </div>

      {error && <p style={{color:"crimson"}}>{error}</p>}
      {out && (
        <section style={{marginTop:16}}>
          <h2>Récapitulatif</h2>
          <p><b>Base/jour:</b> {out.basePerDay} MAD</p>
          <p><b>Brut/semaine:</b> {out.grossWeekly} MAD</p>
          <p><b>Remises:</b> jours {out.discounts.days*100}% · durée {out.discounts.duration*100}%</p>
          <p><b>Total ({duration} sem):</b> {out.total} MAD</p>
          <pre style={{background:"#f7f7f7", padding:12, borderRadius:8}}>{JSON.stringify(out.breakdown, null, 2)}</pre>
        </section>
      )}
    </main>
  );
}
