export default function Footer(){
  return (
    <footer className="footer">
      <div className="container row">
        <div>
          <div style={{fontWeight:700, marginBottom:8}}>Fitnest</div>
          <div className="label">Repas sains livrés, adaptés à vos objectifs.</div>
        </div>
        <div>
          <div style={{fontWeight:600}}>Navigation</div>
          <div className="grid" style={{gridTemplateColumns:"1fr 1fr"}}>
            <a href="/catalogue">Catalogue</a>
            <a href="/plans">Formules</a>
            <a href="/menu">Repas</a>
            <a href="/subscribe">S’abonner</a>
          </div>
        </div>
        <div>
          <div style={{fontWeight:600}}>Légal</div>
          <div className="grid">
            <a href="#">CGU</a>
            <a href="#">Confidentialité</a>
            <a href="#">Mentions légales</a>
          </div>
        </div>
      </div>
      <div className="container" style={{borderTop:"1px solid var(--line)", padding:"12px 0", fontSize:12, color:"var(--muted)"}}>
        © Fitnest {new Date().getFullYear()}
      </div>
    </footer>
  );
}
