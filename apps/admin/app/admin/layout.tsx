export const metadata = { title: "Fitnest Admin", description: "Back-office Fitnest" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica" }}>
        <header style={{
          position: "sticky", top: 0, zIndex: 30,
          background: "#0f172a", color: "white", borderBottom: "1px solid #0b1226"
        }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            maxWidth: 1200, margin: "0 auto", padding: "12px 16px"
          }}>
            <a href="/admin" style={{ display: "flex", gap: 10, textDecoration: "none", color: "white" }}>
              <span style={{
                width: 28, height: 28, borderRadius: 8, background: "#16a34a",
                display: "inline-block"
              }} />
              <strong style={{ fontSize: 18 }}>Fitnest • Admin</strong>
            </a>
            <nav style={{ display: "flex", gap: 16, fontSize: 14 }}>
              <a href="/admin" style={{ color: "white", textDecoration: "none", opacity: 0.9 }}>Dashboard</a>
              <a href="/admin/meals" style={{ color: "white", textDecoration: "none", opacity: 0.9 }}>Meals</a>
              <a href="/admin/plans" style={{ color: "white", textDecoration: "none", opacity: 0.9 }}>Plans</a>
              <a href="/admin/subscriptions" style={{ color: "white", textDecoration: "none", opacity: 0.9 }}>Subscriptions</a>
            </nav>
          </div>
        </header>

        <main style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 16px" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
