import MealCard from "../../components/MealCard";

export const metadata = { title: "Fitnest — Menu" };

async function getMeals() {
  const r = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/meals`, { cache: "no-store" }).catch(()=>null);
  if(!r?.ok) return [];
  const j = await r.json();
  return j.items || [];
}

export default async function MenuPage(){
  const items = await getMeals();

  // groupage par semaine → jour
  const grouped: Record<string, Record<string, any[]>> = {};
  for(const it of items){
    const wk = String(it.week_number ?? 0);
    const day = String(it.day_of_week ?? 0);
    grouped[wk] ??= {}; grouped[wk][day] ??= []; grouped[wk][day].push(it);
  }

  return (
    <main className="container" style={{padding:"24px 0"}}>
      <h1>Menu</h1>
      {items.length === 0 && <p>Menu à venir…</p>}

      {Object.entries(grouped).map(([wk, days])=>(
        <section key={wk} className="card pad" style={{margin:"12px 0"}}>
          <h2 style={{marginTop:0}}>Semaine {wk}</h2>
          <div className="grid" style={{gridTemplateColumns:"repeat(auto-fit, minmax(220px,1fr))"}}>
            {Object.entries(days).map(([day, arr])=>(
              <div key={day}>
                <div className="label" style={{margin:"8px 0"}}>Jour {day}</div>
                <div className="grid" style={{gridTemplateColumns:"1fr", gap:12}}>
                  {(arr as any[]).map((m)=>(
                    <MealCard key={m.id}
                      title={m.title}
                      meal_type={m.meal_type}
                      calories={m.calories}
                      protein_g={m.protein_g}
                      carbs_g={m.carbs_g}
                      fat_g={m.fat_g}
                      image_url={m.image_url}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
