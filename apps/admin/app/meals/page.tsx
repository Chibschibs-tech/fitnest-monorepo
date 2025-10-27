"use client";
import { useEffect, useState } from "react";

type Meal = {
  id?: string; // UUID
  title: string;
  meal_type: "Breakfast" | "Lunch" | "Dinner";
  description?: string;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  image_url?: string;
  day_of_week?: number;
  week_number?: number;
  is_active?: boolean;
  created_at?: string;
};

export default function AdminMeals(){
  const [items, setItems] = useState<Meal[]>([]);
  const [form, setForm] = useState<Meal>({ title:"", meal_type:"Breakfast", is_active:true });
  const [error, setError] = useState<string|null>(null);

  async function load(){
    setError(null);
    const r = await fetch("/api/meals");
    let j:any = {};
    try { j = await r.json(); } catch {}
    if(!r.ok){ setError(j?.error || `GET /api/meals failed ${r.status}`); return; }
    setItems(j.items || []);
  }
  useEffect(()=>{ load(); },[]);

  async function save(){
    setError(null);
    const r = await fetch("/api/meals",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(form),
    });
    let j:any = {};
    try { j = await r.json(); } catch {}
    if(!r.ok){ setError(j?.error || `POST /api/meals failed ${r.status}`); return; }
    setForm({ title:"", meal_type:"Breakfast", is_active:true });
    await load();
  }

  async function del(id:string){
    if(!confirm("Supprimer ce repas ?")) return;
    setError(null);
    const r = await fetch(`/api/meals?id=${encodeURIComponent(id)}`,{ method:"DELETE" });
    let j:any = {};
    try { j = await r.json(); } catch {}
    if(!r.ok){ setError(j?.error || `DELETE /api/meals failed ${r.status}`); return; }
    await load();
  }

  return (
    <main style={{padding:24, display:"grid", gap:16}}>
      <h1>Admin — Meals</h1>
      {error && <pre style={{color:"crimson", whiteSpace:"pre-wrap"}}>{error}</pre>}

      <div style={{display:"grid", gap:8, gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))"}}>
        <input placeholder="Titre" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
        <select value={form.meal_type} onChange={e=>setForm({...form,meal_type:e.target.value as any})}>
          <option>Breakfast</option><option>Lunch</option><option>Dinner</option>
        </select>
        <input type="number" placeholder="Jour (1-7)" value={form.day_of_week||""} onChange={e=>setForm({...form,day_of_week:Number(e.target.value)||undefined})}/>
        <input type="number" placeholder="Semaine" value={form.week_number||""} onChange={e=>setForm({...form,week_number:Number(e.target.value)||undefined})}/>
        <input type="number" placeholder="Calories" value={form.calories||""} onChange={e=>setForm({...form,calories:Number(e.target.value)||undefined})}/>
        <input type="number" placeholder="Prot (g)" value={form.protein_g||""} onChange={e=>setForm({...form,protein_g:Number(e.target.value)||undefined})}/>
        <input type="number" placeholder="Gluc (g)" value={form.carbs_g||""} onChange={e=>setForm({...form,carbs_g:Number(e.target.value)||undefined})}/>
        <input type="number" placeholder="Lip (g)" value={form.fat_g||""} onChange={e=>setForm({...form,fat_g:Number(e.target.value)||undefined})}/>
        <input placeholder="Image URL" value={form.image_url||""} onChange={e=>setForm({...form,image_url:e.target.value||undefined})}/>
        <label><input type="checkbox" checked={!!form.is_active} onChange={e=>setForm({...form,is_active:e.target.checked})}/> Actif</label>
        <button onClick={save}>Ajouter</button>
      </div>

      <table border={1} cellPadding={6}>
        <thead><tr><th>ID</th><th>Titre</th><th>Type</th><th>Jour</th><th>Semaine</th><th>Actif</th><th></th></tr></thead>
        <tbody>
          {items.map(m=>(
            <tr key={m.id}>
              <td>{m.id}</td><td>{m.title}</td><td>{m.meal_type}</td>
              <td>{m.day_of_week ?? "-"}</td><td>{m.week_number ?? "-"}</td>
              <td>{String(m.is_active)}</td>
              <td><button onClick={()=>del(m.id!)}>Supprimer</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
