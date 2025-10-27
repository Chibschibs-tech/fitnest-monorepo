export const metadata = { title: "Fitnest — Formules" };
const PLANS = [
  { key: "Weight Loss", title: "Weight Loss", desc: "Objectif perte de poids" },
  { key: "Stay Fit", title: "Stay Fit", desc: "Rester en forme au quotidien" },
  { key: "Muscle Gain", title: "Muscle Gain", desc: "Prise de masse maîtrisée" },
];
export default function PlansPage(){
  return (
    <main style={{maxWidth:1100, margin:"0 auto", padding:"32px 16px"}}>
      <h1 style={{fontSize:32, marginBottom:16}}>Nos formules</h1>
      <section style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:16}}>
        {PLANS.map(p=>(
          <article key={p.key} style={{border:"1px solid #eee", borderRadius:12, padding:16, display:"grid", gap:8}}>
            <h2 style={{margin:"0 0 4px 0"}}>{p.title}</h2>
            <p style={{opacity:.85, margin:0}}>{p.desc}</p>
            <a href={`/subscribe?plan=${encodeURIComponent(p.key)}`}
               style={{marginTop:12, padding:"8px 12px", border:"1px solid #111", borderRadius:8, width:"fit-content"}}>
              Configurer
            </a>
          </article>
        ))}
      </section>
    </main>
  );
}
