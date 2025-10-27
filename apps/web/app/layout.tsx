import "./globals.css";
export const metadata = { title: "Fitnest", description: "Fitnest Web" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <nav style={{padding:12, borderBottom:"1px solid #eee"}}>
          <a href="/" style={{marginRight:12}}>Accueil</a>
          <a href="/catalogue" style={{marginRight:12}}>Catalogue</a>
          <a href="/plans" style={{marginRight:12}}>Formules</a>
          <a href="/menu" style={{marginRight:12}}>Menu</a>
          <a href="/subscribe">S’abonner</a>
        </nav>
        {children}
      </body>
    </html>
  );
}
