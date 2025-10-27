export const metadata = { title: "Fitnest — Merci !" };

export default function Thanks(){
  return (
    <main className="container" style={{padding:"48px 0", textAlign:"center"}}>
      <h1>Merci !</h1>
      <p>Votre demande a bien été envoyée. Notre équipe vous contactera très rapidement pour finaliser votre abonnement.</p>
      <div style={{marginTop:16}}>
        <a className="btn" href="/">Retour à l’accueil</a>
      </div>
    </main>
  );
}
