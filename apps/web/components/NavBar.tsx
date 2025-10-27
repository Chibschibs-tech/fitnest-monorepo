export default function NavBar(){
  return (
    <div className="nav">
      <div className="container row">
        <a href="/" style={{fontWeight:700}}>Fitnest</a>
        <div className="links">
          <a href="/catalogue">Catalogue</a>
          <a href="/plans">Formules</a>
          <a href="/menu">Repas</a>
          <a href="/subscribe" className="btn brand">S’abonner</a>
        </div>
      </div>
    </div>
  );
}
