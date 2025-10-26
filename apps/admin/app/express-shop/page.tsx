"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-browser";

type Product = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  image_url: string | null;
  price_mad: number;
};

type CartItem = { id: string; title: string; price_mad: number; qty: number };

export default function ExpressShopPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Record<string, CartItem>>({});

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("express_products")
        .select("id, slug, title, description, image_url, price_mad")
        .eq("published", true)
        .order("created_at", { ascending: true });

      if (!error) setProducts((data ?? []) as Product[]);
      setLoading(false);
    })();
  }, []);

  function addToCart(p: Product) {
    setCart((c) => {
      const current = c[p.id];
      const next: CartItem = current
        ? { ...current, qty: current.qty + 1 }
        : { id: p.id, title: p.title, price_mad: p.price_mad, qty: 1 };
      return { ...c, [p.id]: next };
    });
  }
  function decItem(id: string) {
    setCart((c) => {
      const it = c[id];
      if (!it) return c;
      if (it.qty <= 1) {
        const { [id]: _, ...rest } = c;
        return rest;
      }
      return { ...c, [id]: { ...it, qty: it.qty - 1 } };
    });
  }
  function incItem(id: string) {
    setCart((c) => {
      const it = c[id];
      if (!it) return c;
      return { ...c, [id]: { ...it, qty: it.qty + 1 } };
    });
  }
  function clearCart() {
    setCart({});
  }

  const total = useMemo(
    () => Object.values(cart).reduce((s, it) => s + it.qty * it.price_mad, 0),
    [cart]
  );

  async function checkout() {
    // Ici on peut soit :
    // - rediriger vers un unified checkout existant /unified-checkout
    // - ou juste sauvegarder le panier dans localStorage et aller à /order
    // Pour l’instant : on affiche un résumé.
    alert(
      `Commande (Express Shop)\n\n${Object.values(cart)
        .map((it) => `×${it.qty} ${it.title} — ${it.price_mad} MAD`)
        .join("\n")}\n\nTotal: ${total} MAD`
    );
  }

  return (
    <main style={{ display: "grid", gap: 24 }}>
      <nav style={{ display: "flex", gap: 16, marginBottom: 8 }}>
        <Link href="/">Accueil</Link>
        <Link href="/catalogue">Formules</Link>
        <Link href="/meals">Repas</Link>
        <Link href="/express-shop"><strong>Express Shop</strong></Link>
      </nav>

      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0 }}>Express Shop</h1>
          <p style={{ color: "#666", marginTop: 6 }}>
            Commandez quelques produits à la carte, pour aujourd’hui ou demain.
          </p>
        </div>
        {/* Mini-panier */}
        <aside style={{
          minWidth: 280,
          border: "1px solid #eee",
          borderRadius: 12,
          padding: 12,
          background: "#fff"
        }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Mon panier</div>
          {Object.keys(cart).length === 0 ? (
            <div style={{ color: "#666" }}>Panier vide.</div>
          ) : (
            <ul style={{ display: "grid", gap: 8 }}>
              {Object.values(cart).map((it) => (
                <li key={it.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{it.title}</div>
                    <div style={{ color: "#666", fontSize: 12 }}>{it.price_mad} MAD</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button onClick={() => decItem(it.id)}>-</button>
                    <span>{it.qty}</span>
                    <button onClick={() => incItem(it.id)}>+</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
            <strong>Total</strong>
            <strong>{total} MAD</strong>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button onClick={checkout} disabled={Object.keys(cart).length === 0}>
              Valider
            </button>
            <button onClick={clearCart} style={{ opacity: 0.8 }}>
              Vider
            </button>
          </div>
        </aside>
      </header>

      <section>
        {loading ? (
          <p>Chargement…</p>
        ) : products.length === 0 ? (
          <p>Aucun produit disponible.</p>
        ) : (
          <div style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))"
          }}>
            {products.map((p) => (
              <article key={p.id}
                style={{ border: "1px solid #eee", borderRadius: 12, overflow: "hidden", background: "#fff" }}>
                <div style={{
                  aspectRatio: "4/3",
                  background: p.image_url ? `center/cover no-repeat url(${p.image_url})` : "#f3f3f3"
                }} />
                <div style={{ padding: 12 }}>
                  <div style={{ fontWeight: 700 }}>{p.title}</div>
                  <div style={{ color: "#666", minHeight: 36 }}>
                    {p.description ?? "—"}
                  </div>
                  <div style={{ marginTop: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong>{p.price_mad} MAD</strong>
                    <button onClick={() => addToCart(p)}>Ajouter</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
