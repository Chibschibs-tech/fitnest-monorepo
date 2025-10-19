export const metadata = { title: "Fitnest Admin" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ fontFamily: "system-ui", margin: 24 }}>
        <nav style={{ display: "flex", gap: 16, marginBottom: 24 }}>
          <a href="/admin">Dashboard</a>
          <a href="/admin/meals">Meals</a>
          <a href="/admin/plans">Plans</a>
        </nav>
        {children}
      </body>
    </html>
  );
}
