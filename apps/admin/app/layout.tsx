export const metadata = { title: "Fitnest", description: "Repas sains, abonnements flexibles" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica" }}>
        <header style={{
          position: "sticky", top: 0, zIndex: 30,
          background: "white", borderBottom: "1px solid #eee"
        }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            maxWidth: 1160, margin: "0 auto", padding: "12px 16px"
          }}>
            <a href="/" style={{ display: "flex", gap: 8, textDecoration: "none", color: "inherit" }}>
              <span style={{
                width: 28, height: 28, borderRadius: 8, background: "#16a34a",
                display: "inline-block"
              }} />
              <strong style={{ fontSize: 18 }}>Fitnest</strong>
            </a>
            <nav style={{ display: "flex", gap: 16, fontSize: 14 }}>
              <a href="/catalogue" style={{ color: "#222", textDecoration: "none" }}>Formules</a>
              <a href="/meals" style={{ color: "#222", textDecoration: "none" }}>Repas</a>
              <a href="/account" style={{ color: "#222", textDecoration: "none" }}>Mon compte</a>
            </nav>
          </div>
        </header>
        <main style={{ maxWidth: 1160, margin: "0 auto", padding: "20px 16px" }}>
          {children}
        </main>
        <footer style={{ borderTop: "1px solid #eee", marginTop: 40 }}>
          <div style={{ maxWidth: 1160, margin: "0 auto", padding: "20px 16px", color: "#777", fontSize: 13 }}>
            © {new Date().getFullYear()} Fitnest — Bien manger, simplement.
          </div>
        </footer>
      </body>
    </html>
  );
}
