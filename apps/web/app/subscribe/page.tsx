"use client";
import { useEffect, useMemo, useState } from "react";
import { mad } from "../../lib/format";
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
  function toggle(meal: Meal){ setMeals(m => m.includes(meal) ? m.filter(x=>x!==meal) : [...m, meal]); }

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

  const checkoutHref = `/subscribe/checkout?plan=${encodeURIComponent(plan)}${meals.map(m=>`&meals=${encodeURIComponent(m)}`).join("")}&days=${days}&duration=${duration}`;

  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-2xl font-bold">Choose your plan</h1>

      <section className="rounded-xl border p-4 bg-white space-y-4">
        <div>
          <div className="text-xs text-gray-500 mb-1">Plan</div>
          <select value={plan} onChange={e=>setPlan(e.target.value)} className="rounded-md border px-3 py-2">
            <option>Weight Loss</option><option>Stay Fit</option><option>Muscle Gain</option>
          </select>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Meals per day</div>
          <div className="flex gap-2 flex-wrap">
            {(["Breakfast","Lunch","Dinner"] as Meal[]).map(m=>(
              <label key={m} className={`rounded-md border px-3 py-2 cursor-pointer ${meals.includes(m) ? "border-fitnest-green text-fitnest-green" : ""}`}>
                <input type="checkbox" className="mr-2" checked={meals.includes(m)} onChange={()=>toggle(m)} /> {m}
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-4 flex-wrap">
          <div>
            <div className="text-xs text-gray-500 mb-1">Days / week</div>
            <input type="number" min={1} max={7} value={days} onChange={e=>setDays(Number(e.target.value))} className="rounded-md border px-3 py-2 w-28"/>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Duration (weeks)</div>
            <input type="number" min={1} value={duration} onChange={e=>setDuration(Number(e.target.value))} className="rounded-md border px-3 py-2 w-28"/>
          </div>
          <div className="self-end">
            <button className="rounded-full bg-fitnest-green px-4 py-2 text-sm font-medium text-white hover:bg-fitnest-green/90" onClick={calc} disabled={loading}>
              {loading?"Calcul…":"Calculate"}
            </button>
          </div>
        </div>
      </section>

      {error && <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      {out && (
        <section className="rounded-xl border p-4 bg-white space-y-3">
          <h2 className="text-lg font-semibold">Summary</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div><div className="text-xs text-gray-500">Base / day</div><div className="text-xl font-bold">{mad(out.basePerDay)}</div></div>
            <div><div className="text-xs text-gray-500">Gross / week</div><div className="text-xl font-bold">{mad(out.grossWeekly)}</div></div>
            <div><div className="text-xs text-gray-500">Total ({duration} weeks)</div><div className="text-2xl font-extrabold">{mad(out.total)}</div></div>
          </div>
          <div className="flex gap-3">
            <a className="rounded-full bg-fitnest-green px-4 py-2 text-sm font-medium text-white hover:bg-fitnest-green/90" href={checkoutHref}>Continue</a>
            <a className="rounded-full border px-4 py-2 text-sm hover:border-fitnest-green hover:text-fitnest-green" href="/plans">See plans</a>
          </div>
        </section>
      )}
    </div>
  );
}
