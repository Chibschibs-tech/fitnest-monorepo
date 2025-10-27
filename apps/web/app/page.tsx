export const metadata = { title: "Fitnest — Accueil" };

export default function HomePage(){
  return (
    <main className="container">
      <section className="hero">
        <h1>Mangez mieux. Gagnez du temps.</h1>
        <p>Repas équilibrés, frais chaque jour. Plans adaptés à la perte de poids, maintien ou prise de masse.</p>
        <div style={{display:"flex",gap:12,justifyContent:"center",marginTop:12,flexWrap:"wrap"}}>
          <a href="/subscribe" className="btn brand">Je m’abonne</a>
          <a href="/catalogue" className="btn">Découvrir l’offre</a>
        </div>
      </section>
    </main>
  );
}
