"use client";
import { useEffect, useState } from "react";
import { mad } from "../../../lib/format";

type Meal = "Breakfast" | "Lunch" | "Dinner";

export default function CheckoutPage(){
  const [plan, setPlan] = useState("Weight Loss");
  const [meals, setMeals] = useState<Meal[]>(["Breakfast","Lunch"]);
  const [days, setDays] = useState(5);
  const [duration, setDuration] = useState(4);
  const [price, setPrice] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string|null>(null);

  const [full_name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");

  // on récupère les params si on vient de /subscribe
  useEffect(()=>{
    const sp = new URLSearchParams(window.location.search);
    const p = sp.get("plan"); if(p) setPlan(p);
    const m = sp.getAll("meals"); if(m.length) setMeals(m as Meal[]);
    const d1 = Number(sp.get("days")); if(d1) setDays(d1);
    const d2 = Number(sp.get("duration")); if(d2) setDuration(d2);
  },[]);

  async function calc(){
    setErr(null); setLoading(true);
    try{
      const r = await fetch("/api/calculate-price",{
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ plan, meals, days, duration })
      });
      const j = await r.json();
      if(!r.ok){ setErr(j.error || "Erreur pricing"); setPrice(null); return; }
      setPrice(j);
    }finally{ setLoading(false); }
  }
  useEffect(()=>{ calc(); /* recalcul on mount */ },[]);

  async function submit(){
    if(!price){ setErr("Veuillez recalculer le prix."); return; }
    setErr(null); setLoading(true);
    try{
      const r = await fetch("/api/checkout",{
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ plan, meals, days, duration, total: price.total, full_name, email, phone, note })
      });
      const j = await r.json();
      if(!r.ok){ setErr(j.error || "Erreur envoi"); return; }
      window.location.href = "/subscribe/thanks";
    }finally{ setLoading(false); }
  }

  return (
    <main className="container" style={{padding:"24px 0", display:"grid", gap:16}}>
      <h1>Validation</h1>

      <section className="card pad">
        <h3 style={{marginTop:0}}>Récapitulatif</h3>
        <div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))"}}>
          <div><div className="label">Formule</div><div>{plan}</div></div>
          <div><div className="label">Repas/jour</div><div>{meals.join(", ")}</div></div>
          <div><div className="label">Jours/Semaine</div><div>{days}</div></div>
          <div><div className="label">Durée</div><div>{duration} semaines</div></div>
          {price && <div><div className="label">Total</div><div style={{fontWeight:800}}>{mad(price.total)}</div></div>}
        </div>
        <div style={{marginTop:8}}>
          <button className="btn" onClick={calc} disabled={loading}>{loading?"Calcul…":"Recalculer"}</button>
        </div>
      </section>

      <section className="card pad">
        <h3 style={{marginTop:0}}>Coordonnées</h3>
        <div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))"}}>
          <div><div className="label">Nom complet</div><input value={full_name} onChange={e=>setFullName(e.target.value)} /></div>
          <div><div className="label">Email</div><input value={email} onChange={e=>setEmail(e.target.value)} /></div>
          <div><div className="label">Téléphone</div><input value={phone} onChange={e=>setPhone(e.target.value)} /></div>
          <div style={{gridColumn:"1/-1"}}><div className="label">Note</div><input value={note} onChange={e=>setNote(e.target.value)} /></div>
        </div>
        {err && <div style={{color:"crimson",marginTop:8}}>{err}</div>}
        <div style={{marginTop:12}}>
          <button className="btn brand" onClick={submit} disabled={loading || !full_name || !email || !phone}>
            {loading?"Envoi…":"Envoyer la demande"}
          </button>
        </div>
      </section>
    </main>
  );
}
