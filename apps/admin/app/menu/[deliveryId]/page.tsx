"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function MenuByDeliveryPage() {
  const { deliveryId } = useParams<{ deliveryId: string }>();

  return (
    <main style={{ padding: 24 }}>
      <nav style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <Link href="/">Dashboard</Link>
        <Link href="/catalogue">Catalogue</Link>
        <Link href="/account">Mon compte</Link>
      </nav>

      <h1>Composer le menu – Livraison #{String(deliveryId)}</h1>
      <p>Écran “par livraison”. On branchera ici la sélection des plats et leurs options.</p>
    </main>
  );
}
