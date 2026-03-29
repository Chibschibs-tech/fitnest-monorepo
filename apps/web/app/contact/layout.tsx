import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Contact | Fitnest.ma",
  description:
    "Contactez Fitnest.ma : questions sur les abonnements repas, livraison au Maroc et zones desservies. Écrivez-nous ou appelez notre équipe à Casablanca.",
}

export default function ContactLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
