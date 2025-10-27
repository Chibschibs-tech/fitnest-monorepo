export const metadata = { title: "Fitnest — Menu" };

async function getMeals() {
  // Relative fetch marche en dev & preview
  const r = await fetch("/api/meals", { cache: "no-store" });
  if (!r.ok) return [];
  const j = await r.json();
  return j.items || [];
}

export default async function MenuPage(){
  const items = await getMeals();

  return (
    <main style={{maxWidth:1100, margin:"0 auto", padding:"32px 16px"}}>
      <h1 style={{fontSize:32, marginBottom:16}}>Menu</h1>
      {items.length === 0 && <p>Menu à venir…</p>}
      {items.length > 0 && (
        <div style={{display:"grid", gap:24}}>
          {Object.entries(
            items.reduce((acc:any, it:any)=>{
              const wk = it.week_number ?? 0;
              const day = it.day_of_week ?? 0;
              acc[wk] ??= {}; acc[wk][day] ??= []; acc[wk][day].push(it);
              return acc;
            }, {})
          ).map(([wk, days])=>(
            <section key={wk} style={{display:"grid", gap:12}}>
              <h2 style={{margin:"8px 0"}}>Semaine {wk}</h2>
              <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:16}}>
                {Object.entries(days as any).map(([day, arr]: any)=>(
                  <article key={day} style={{border:"1px solid #eee", borderRadius:12, padding:12}}>
                    <h3 style={{marginTop:0}}>Jour {day}</h3>
                    <ul style={{margin:0, paddingLeft:16}}>
                      {arr.map((m:any)=>(
                        <li key={m.id}><b>{m.meal_type}:</b> {m.title}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
