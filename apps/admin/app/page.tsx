export default function HomePage() {
  return (
    <main>
      <section style={{
        display: "grid",
        gridTemplateColumns: "1.2fr 1fr",
        gap: 24,
        alignItems: "center",
        marginBottom: 36
      }}>
        <div>
          <h1 style={{ fontSize: 40, lineHeight: 1.1, margin: "8px 0" }}>
            Bien manger, simplement.
          </h1>
          <p style={{ color: "#555", fontSize: 18 }}>
            Plans repas flexibles, livrés à domicile. Choisissez vos jours, vos plats — on s’occupe du reste.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <a href="/catalogue" style={{
              padding: "10px 16px", borderRadius: 10, background: "#16a34a", color: "white",
              textDecoration: "none", fontWeight: 600
            }}>Voir les formules</a>
            <a href="/meals" style={{
              padding: "10px 16px", borderRadius: 10, border: "1px solid #ccc", color: "#222",
              textDecoration: "none", fontWeight: 600
            }}>Parcourir les repas</a>
          </div>
        </div>
        <div>
          <div style={{
            width: "100%", height: 260, borderRadius: 16, background:
              "linear-gradient(135deg, rgba(22,163,74,0.15), rgba(22,163,74,0.05))",
            border: "1px solid #E5E7EB"
          }} />
        </div>
      </section>

      <section>
        <h2 style={{ marginBottom: 12 }}>Comment ça marche ?</h2>
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          {[
            ["Choisissez une formule", "Des variantes adaptées à vos objectifs."],
            ["Sélectionnez vos jours", "1 à 4 semaines — flexible et simple."],
            ["Composez vos menus", "Choisissez vos plats préférés à chaque livraison."],
            ["On livre chez vous", "Toujours frais, prêt à déguster."]
          ].map(([t, d]) => (
            <div key={t} style={{ border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
              <div style={{ fontWeight: 700 }}>{t}</div>
              <div style={{ color: "#666", marginTop: 6 }}>{d}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
