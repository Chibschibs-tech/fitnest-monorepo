export const metadata = { title: "Fitnest — Catalogue" };

export default function CataloguePage(){
  return (
    <main style={{maxWidth:1200, margin:"0 auto", padding:"32px 16px"}}>
      {/* Hero */}
      <section style={{display:"grid", gap:16, marginBottom:32}}>
        <h1 style={{fontSize:36, lineHeight:1.2}}>Mangez sain. Gagnez du temps.<br/>Plans adaptés à vos objectifs.</h1>
        <p style={{maxWidth:700}}>Remplacez ce texte par le contenu de fitnest.ma (section Hero). CTA ci-dessous.</p>
        <div style={{display:"flex", gap:12}}>
          <a href="/subscribe" style={{padding:"10px 16px", border:"1px solid #111", borderRadius:8}}>Je m’abonne</a>
          <a href="/plans" style={{padding:"10px 16px", border:"1px solid #ddd", borderRadius:8}}>Voir les formules</a>
        </div>
      </section>

      {/* Avantages (3 colonnes) */}
      <section style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:16, marginBottom:32}}>
        {[
          {t:"Fraîcheur quotidienne", d:"Remplacez par le texte exact."},
          {t:"Plans personnalisés", d:"Exact wording du site actuel."},
          {t:"Livraison flexible", d:"Idem."},
        ].map((b,i)=>(
          <article key={i} style={{padding:16, border:"1px solid #eee", borderRadius:12}}>
            <h3 style={{margin:"0 0 6px 0"}}>{b.t}</h3>
            <p style={{opacity:.8, margin:0}}>{b.d}</p>
          </article>
        ))}
      </section>

      {/* Showcase de repas */}
      <section style={{display:"grid", gap:16, marginBottom:32}}>
        <h2>Exemples de repas</h2>
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:16}}>
          {[1,2,3,4,5,6].map(i=>(
            <div key={i} style={{border:"1px solid #eee", borderRadius:12, overflow:"hidden", background:"#fafafa", height:160, display:"grid", placeItems:"center"}}>
              <span>Image {i} (remplacer)</span>
            </div>
          ))}
        </div>
      </section>

      {/* Témoignages / FAQ / Footer links — placeholders */}
      <section style={{display:"grid", gap:12, marginBottom:48}}>
        <h2>Témoignages</h2>
        <p>Remplacer par les témoignages/notes du site actuel.</p>
      </section>

      <section style={{display:"grid", gap:12}}>
        <h2>FAQ</h2>
        <details><summary>Question 1</summary><p>Réponse à remplacer.</p></details>
        <details><summary>Question 2</summary><p>Réponse à remplacer.</p></details>
      </section>
    </main>
  );
}
