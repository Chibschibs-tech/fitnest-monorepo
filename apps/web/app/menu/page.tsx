"use client";
import { useEffect, useMemo, useState } from "react";
type Meal = {
  id: string; title: string; type: "Breakfast"|"Lunch"|"Dinner";
  calories: number|null; protein_g: number|null; carbs_g: number|null; fat_g: number|null;
  image_url: string|null; week: number|null; day: number|null; is_active: boolean;
};
const placeholder = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&q=60&auto=format&fit=crop";

export default function MenuPage(){
  const [items, setItems] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string|null>(null);
  const [week, setWeek] = useState<number|"" >("");
  const [day, setDay]   = useState<number|"" >("");
  const [type, setType] = useState<string>("");

  async function fetchMeals(){
    setLoading(true); setErr(null);
    try{
      const p = new URLSearchParams({ active: "1" });
      if(week!=="") p.set("week", String(week));
      if(day!=="")  p.set("day",  String(day));
      if(type)      p.set("type", type);
      const r = await fetch(`/api/meals?${p.toString()}`);
      const j = await r.json();
      if(!r.ok){ setErr(j.error||"Erreur"); setItems([]); return; }
      setItems(j.items);
    } finally { setLoading(false); }
  }
  useEffect(()=>{ fetchMeals(); }, [week, day, type]);

  const grouped = useMemo(()=>{
    const g: Record<string, Meal[]> = { Breakfast:[], Lunch:[], Dinner:[] };
    for(const m of items) g[m.type]?.push(m);
    return g;
  }, [items]);

  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-2xl font-bold">Meals</h1>

      <div className="rounded-xl border p-4 bg-white grid gap-3 md:grid-cols-4">
        <div>
          <div className="text-xs text-gray-500 mb-1">Type</div>
          <select className="border rounded-md px-3 py-2 w-full" value={type} onChange={e=>setType(e.target.value)}>
            <option value="">All</option><option>Breakfast</option><option>Lunch</option><option>Dinner</option>
          </select>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Week</div>
          <input className="border rounded-md px-3 py-2 w-full" type="number"
                 value={week} onChange={e=>setWeek(e.target.value===""?"":Number(e.target.value))} placeholder="e.g. 44"/>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Day</div>
          <input className="border rounded-md px-3 py-2 w-full" type="number"
                 value={day} onChange={e=>setDay(e.target.value===""?"":Number(e.target.value))} placeholder="1-7"/>
        </div>
        <div className="flex items-end">
          <button onClick={()=>{ setWeek(""); setDay(""); setType(""); }}
                  className="border rounded-md px-4 py-2 hover:border-fitnest-green hover:text-fitnest-green w-full">
            Reset
          </button>
        </div>
      </div>

      {err && <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}
      {loading && <div>Loading…</div>}

      {!loading && !err && (
        <div className="space-y-10">
          {(["Breakfast","Lunch","Dinner"] as const).map(t => (
            <section key={t}>
              <h2 className="text-xl font-semibold mb-3">{t}</h2>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {grouped[t].map(m => (
                  <article key={m.id} className="rounded-xl border bg-white overflow-hidden">
                    <img src={m.image_url || placeholder} alt={m.title} className="h-40 w-full object-cover"/>
                    <div className="p-4 space-y-2">
                      <div className="font-semibold">{m.title}</div>
                      <div className="text-xs text-gray-500">
                        {m.calories??"-"} kcal · P {m.protein_g??"-"}g · C {m.carbs_g??"-"}g · F {m.fat_g??"-"}g
                      </div>
                      <div className="text-xs text-gray-500">
                        {m.week ? `Week ${m.week}` : ""} {m.day ? `— Day ${m.day}` : ""}
                      </div>
                    </div>
                  </article>
                ))}
                {grouped[t].length === 0 && <div className="text-sm text-gray-500">No meals.</div>}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
