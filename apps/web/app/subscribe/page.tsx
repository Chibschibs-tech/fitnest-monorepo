"use client";
import { useEffect, useMemo, useState } from "react";
type Meal = "Breakfast" | "Lunch" | "Dinner";

export default function SubscribePage(){
  const search = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const urlPlan = useMemo(() => (search?.get("plan") || "Weight Loss"), [search]);

  const [plan, setPlan] = useState(urlPlan);
  const [meals, setMeals] = useState<Meal[]>(["Breakfast","Lunch"]);
  const [days, setDays] = useState(5);
  const [duration, setDuration] = useState(4);
  const [out, setOut] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      if(!r.ok){ setError(j.error || "Erreur"); setOut(null); return; }
      setOut(j);
    } finally { setLoading(false); }
  }

  return (
    <main className="container" style={{padding:"24px 0", display:"grid", gap:16}}>
      <h1>Choisir mon abonnement</h1>

      <section className="card pad">
        <div className="label" style={{marginBottom:8}}>Formule</div>
        <div className="form-row">
          <select value={plan} onChange={e=>setPlan(e.target.value)}>
            <option>Weight Loss</option>
            <option>Stay Fit</option>
            <option>Muscle Gain</option>
          </select>
        </div>

        <div className="label" style={{margin:"16px 0 8px"}}>Repas / jour</div>
        <div className="form-row">
          {(["Breakfast","Lunch","Dinner"] as Meal[]).map(m=>(
            <label key={m} className="checkbox">
              <input type="checkbox" checked={meals.includes(m)} onChange={()=>toggle(m)} /> {m}
            </label>
          ))}
        </div>

        <div className="form-row" style={{marginTop:16}}>
          <div>
            <div className="label">Jours / semaine</div>
            <input type="number" min={1} max={7} value={days} onChange={e=>setDays(Number(e.target.value))}/>
          </div>
          <div>
            <div className="label">Durée (semaines)</div>
            <input type="number" min={1} value={duration} onChange={e=>setDuration(Number(e.target.value))}/>
          </div>
          <div style={{alignSelf:"end"}}>
            <button className="btn brand" onClick={calc} disabled={loading}>{loading?"Calcul…":"Calculer"}</button>
          </div>
        </div>
      </section>

      {error && <div className="card pad" style={{borderColor:"crimson", color:"crimson"}}>{error}</div>}

      {out && (
        <section className="card pad price-box">
          <h2 style={{marginTop:0}}>Récapitulatif</h2>
          <div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))"}}>
            <div><div className="label">Base / jour</div><div style={{fontSize:20,fontWeight:700}}>{out.basePerDay} MAD</div></div>
            <div><div className="label">Brut / semaine</div><div style={{fontSize:20,fontWeight:700}}>{out.grossWeekly} MAD</div></div>
            <div><div className="label">Remise jours</div><div>{out.discounts.days*100}%</div></div>
            <div><div className="label">Remise durée</div><div>{out.discounts.duration*100}%</div></div>
            <div><div className="label">Total ({duration} sem.)</div><div style={{fontSize:24,fontWeight:800}}>{out.total} MAD</div></div>
          </div>
          <div className="label" style={{marginTop:12}}>Détail</div>
          <pre className="card pad" style={{background:"#fff"}}>{JSON.stringify(out.breakdown, null, 2)}</pre>
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
            <a href="/subscribe/checkout" className="btn brand">Continuer</a>
            <a href="/plans" className="btn">Voir les formules</a>
          </div>
        </section>
      )}
    </main>
  );
}
