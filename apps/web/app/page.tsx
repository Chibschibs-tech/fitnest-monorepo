export const metadata = { title: "Fitnest — Accueil", description: "Repas sains livrés, adaptés à vos objectifs." };

export default function HomePage(){
  return (
    <main style={{maxWidth:1000, margin:"0 auto", padding:"48px 16px"}}>
      <section style={{display:"grid", gap:16, textAlign:"center"}}>
        <h1 style={{fontSize:40, lineHeight:1.1, margin:0}}>
          Mangez mieux. Gagnez du temps.
        </h1>
        <p style={{opacity:.85, margin:"0 auto", maxWidth:720}}>
          Repas équilibrés, frais chaque jour. Plans adaptés à la perte de poids, maintien ou prise de masse.
        </p>
        <div style={{display:"flex", gap:12, justifyContent:"center", marginTop:12, flexWrap:"wrap"}}>
          <a href="/subscribe" style={{padding:"10px 16px", border:"1px solid #111", borderRadius:8}}>Je m’abonne</a>
          <a href="/catalogue" style={{padding:"10px 16px", border:"1px solid #ddd", borderRadius:8}}>Découvrir l’offre</a>
        </div>
      </section>
    </main>
  );
}
