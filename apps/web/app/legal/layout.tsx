import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Mentions légales | Fitnest.ma",
  description:
    "Mentions légales Fitnest.ma : éditeur du site, hébergeur et propriété intellectuelle. Informations légales du service de livraison de repas au Maroc.",
}

export default function LegalLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
