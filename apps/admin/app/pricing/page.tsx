"use client";
import { useEffect, useState } from "react";

type MealPrice = { id:number; plan_name:string; meal_type:string; base_price_mad:number; is_active:boolean };
type Rule = { id:number; discount_type:string; condition_value:number; discount_percentage:number; stackable:boolean; is_active:boolean };

export default function AdminPricing() {
  const [mealPrices, setMealPrices] = useState<MealPrice[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [mpForm, setMpForm] = useState<Partial<MealPrice>>({ plan_name:"Weight Loss", meal_type:"Breakfast", base_price_mad:45, is_active:true });
  const [ruleForm, setRuleForm] = useState<Partial<Rule>>({ discount_type:"days_per_week", condition_value:5, discount_percentage:0.03, stackable:true, is_active:true });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const a = await fetch("/api/pricing/meal-prices").then(r=>r.json());
    const b = await fetch("/api/pricing/discount-rules").then(r=>r.json());
    setMealPrices(a.items||[]);
    setRules(b.items||[]);
  }
  useEffect(()=>{ load(); },[]);

  async function saveMealPrice() {
    setLoading(true); setMsg(null);
    const r = await fetch("/api/pricing/meal-prices",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(mpForm)});
    const j = await r.json(); if(!r.ok) setMsg(j.error||"Error"); await load(); setLoading(false);
  }
  async function deleteMealPrice(id:number){
    setLoading(true); setMsg(null);
    const r = await fetch(`/api/pricing/meal-prices?id=${id}`,{method:"DELETE"});
    const j = await r.json(); if(!r.ok) setMsg(j.error||"Error"); await load(); setLoading(false);
  }

  async function saveRule() {
    setLoading(true); setMsg(null);
    const r = await fetch("/api/pricing/discount-rules",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(ruleForm)});
    const j = await r.json(); if(!r.ok) setMsg(j.error||"Error"); await load(); setLoading(false);
  }
  async function deleteRule(id:number){
    setLoading(true); setMsg(null);
    const r = await fetch(`/api/pricing/discount-rules?id=${id}`,{method:"DELETE"});
    const j = await r.json(); if(!r.ok) setMsg(j.error||"Error"); await load(); setLoading(false);
  }

  return (
    <main style={{padding:24, display:"grid", gap:24}}>
      <h1>Admin — Pricing</h1>
      {msg && <pre style={{color:"crimson"}}>{msg}</pre>}

      <section style={{display:"grid", gap:12}}>
        <h2>Meal Prices</h2>
        <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
          <input placeholder="Plan" value={mpForm.plan_name||""} onChange={e=>setMpForm({...mpForm,plan_name:e.target.value})}/>
          <input placeholder="Meal type" value={mpForm.meal_type||""} onChange={e=>setMpForm({...mpForm,meal_type:e.target.value})}/>
          <input placeholder="Price MAD" type="number" value={mpForm.base_price_mad||0} onChange={e=>setMpForm({...mpForm,base_price_mad:Number(e.target.value)})}/>
          <label><input type="checkbox" checked={!!mpForm.is_active} onChange={e=>setMpForm({...mpForm,is_active:e.target.checked})}/> active</label>
          <button onClick={saveMealPrice} disabled={loading}>Save</button>
        </div>
        <table border={1} cellPadding={6}>
          <thead><tr><th>ID</th><th>Plan</th><th>Meal</th><th>Price</th><th>Active</th><th>Actions</th></tr></thead>
          <tbody>
            {mealPrices.map(m=>(
              <tr key={m.id}>
                <td>{m.id}</td><td>{m.plan_name}</td><td>{m.meal_type}</td><td>{m.base_price_mad}</td><td>{String(m.is_active)}</td>
                <td><button onClick={()=>setMpForm(m)}>Edit</button> <button onClick={()=>deleteMealPrice(m.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={{display:"grid", gap:12}}>
        <h2>Discount Rules</h2>
        <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
          <select value={ruleForm.discount_type||"days_per_week"} onChange={e=>setRuleForm({...ruleForm,discount_type:e.target.value})}>
            <option value="days_per_week">days_per_week</option>
            <option value="duration_weeks">duration_weeks</option>
          </select>
          <input placeholder="Condition (days/weeks)" type="number" value={ruleForm.condition_value||0} onChange={e=>setRuleForm({...ruleForm,condition_value:Number(e.target.value)})}/>
          <input placeholder="Discount (0.10 for 10%)" type="number" step="0.01" value={ruleForm.discount_percentage||0} onChange={e=>setRuleForm({...ruleForm,discount_percentage:Number(e.target.value)})}/>
          <label><input type="checkbox" checked={!!ruleForm.stackable} onChange={e=>setRuleForm({...ruleForm,stackable:e.target.checked})}/> stackable</label>
          <label><input type="checkbox" checked={!!ruleForm.is_active} onChange={e=>setRuleForm({...ruleForm,is_active:e.target.checked})}/> active</label>
          <button onClick={saveRule} disabled={loading}>Save</button>
        </div>
        <table border={1} cellPadding={6}>
          <thead><tr><th>ID</th><th>Type</th><th>Cond</th><th>Discount</th><th>Stack</th><th>Active</th><th>Actions</th></tr></thead>
          <tbody>
            {rules.map(r=>(
              <tr key={r.id}>
                <td>{r.id}</td><td>{r.discount_type}</td><td>{r.condition_value}</td><td>{r.discount_percentage}</td>
                <td>{String(r.stackable)}</td><td>{String(r.is_active)}</td>
                <td><button onClick={()=>setRuleForm(r)}>Edit</button> <button onClick={()=>deleteRule(r.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
