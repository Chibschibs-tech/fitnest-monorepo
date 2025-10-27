import "./globals.css";
export const metadata = { title: "Fitnest", description: "Fitnest Web" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav style={{padding:12, borderBottom:"1px solid #eee"}}>
          <a href="/" style={{marginRight:12}}>Accueil</a>
          <a href="/subscribe">Subscribe</a>
        </nav>
        {children}
      </body>
    </html>
  );
}
