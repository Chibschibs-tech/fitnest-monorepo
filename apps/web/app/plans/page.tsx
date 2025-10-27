export const metadata = { title: "Fitnest — Formules" };
const PLANS = [
  { key: "Weight Loss", title: "Weight Loss", desc: "Objectif perte de poids" },
  { key: "Stay Fit", title: "Stay Fit", desc: "Rester en forme au quotidien" },
  { key: "Muscle Gain", title: "Muscle Gain", desc: "Prise de masse maîtrisée" },
];
export default function PlansPage(){
  return (
    <main className="container" style={{padding:"24px 0"}}>
      <h1>Nos formules</h1>
      <section className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))"}}>
        {PLANS.map(p=>(
          <article key={p.key} className="card pad">
            <h3 style={{margin:"0 0 4px"}}>{p.title}</h3>
            <div className="label" style={{marginBottom:8}}>{p.desc}</div>
            <a href={`/subscribe?plan=${encodeURIComponent(p.key)}`} className="btn brand">Configurer</a>
          </article>
        ))}
      </section>
    </main>
  );
}
