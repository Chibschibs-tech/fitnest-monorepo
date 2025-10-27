export const metadata = { title: "Fitnest — Catalogue" };

export default function CataloguePage(){
  return (
    <main className="container" style={{padding:"24px 0", display:"grid", gap:24}}>
      <section className="hero" style={{textAlign:"left"}}>
        <h1>Des repas adaptés à vos objectifs</h1>
        <p>Perte de poids, maintien, prise de masse. Ingrédients frais, portions contrôlées, livraison quotidienne.</p>
        <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
          <a href="/subscribe" className="btn brand">Configurer mon abonnement</a>
          <a href="/menu" className="btn">Voir le menu</a>
        </div>
      </section>

      <section className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))"}}>
        <article className="card pad"><h3>Qualité</h3><div className="label">Produits frais, recettes équilibrées.</div></article>
        <article className="card pad"><h3>Pratique</h3><div className="label">Livraison et portions prêtes à consommer.</div></article>
        <article className="card pad"><h3>Flexible</h3><div className="label">Choix des repas, jours/semaine, durée.</div></article>
      </section>

      <section className="card pad">
        <h2 style={{marginTop:0}}>Nos formules</h2>
        <div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))"}}>
          <div className="card pad"><b>Weight Loss</b><div className="label">Réduction calorique maîtrisée.</div><a href="/subscribe?plan=Weight%20Loss" className="btn brand" style={{marginTop:8}}>Choisir</a></div>
          <div className="card pad"><b>Stay Fit</b><div className="label">Équilibre et constance.</div><a href="/subscribe?plan=Stay%20Fit" className="btn brand" style={{marginTop:8}}>Choisir</a></div>
          <div className="card pad"><b>Muscle Gain</b><div className="label">Apport protéique renforcé.</div><a href="/subscribe?plan=Muscle%20Gain" className="btn brand" style={{marginTop:8}}>Choisir</a></div>
        </div>
      </section>

      <section className="card pad">
        <h2 style={{marginTop:0}}>Exemple de semaine</h2>
        <div className="label">Parcourez le <a href="/menu" style={{textDecoration:"underline"}}>menu complet</a> pour voir le détail.</div>
      </section>
    </main>
  );
}
