import { supabase } from "@fitnest/db/src/client";
import { createPlan, addVariant, deletePlan } from "./actions";

export default async function PlansPage() {
  const { data: plans, error } = await supabase.from("plans").select("*").order("id");
  if (error) return <div>Supabase error: {error.message}</div>;

  return (
    <div>
      <h1>Meal Plans</h1>

      <h3 style={{ marginTop: 16 }}>Create plan</h3>
      <form action={createPlan} style={{ display:"grid", gap:8, maxWidth:520 }}>
        <input name="slug" placeholder="slug (unique)" required />
        <input name="title" placeholder="title" required />
        <select name="audience" defaultValue="balanced">
          <option value="keto">keto</option>
          <option value="lowcarb">lowcarb</option>
          <option value="balanced">balanced</option>
          <option value="muscle">muscle</option>
          <option value="custom">custom</option>
        </select>
        <button>Create</button>
      </form>

      <div style={{ marginTop: 24, display:"grid", gap:16 }}>
        {(plans ?? []).map(async (p:any) => {
          const { data: variants } = await supabase
            .from("plan_variants")
            .select("*")
            .eq("meal_plan_id", p.id)
            .order("id");

          return (
            <div key={p.id} style={{ border:"1px solid #ddd", padding:12 }}>
              <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                <strong>{p.title}</strong> • {p.audience}
                <form action={async () => { "use server"; await deletePlan(p.id); }}>
                  <button>Delete</button>
                </form>
              </div>

              <ul style={{ marginTop:8 }}>
                {(variants ?? []).map((v:any) => (
                  <li key={v.id}>
                    {v.label} — {v.days_per_week}j • {v.meals_per_day} repas/j — {v.weekly_price_mad} MAD
                  </li>
                ))}
              </ul>

              <form action={addVariant} style={{ display:"grid", gap:6, maxWidth:520, marginTop:8 }}>
                <input type="hidden" name="mealPlanId" value={p.id} />
                <input name="label" placeholder="label (ex: 5 jours • 3 repas/jour)" required />
                <input name="daysPerWeek" type="number" defaultValue={5} />
                <input name="mealsPerDay" type="number" defaultValue={3} />
                <input name="weeklyPriceMAD" type="number" step="0.01" defaultValue={899} />
                <button>Add variant</button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
