import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Politique de confidentialité | Fitnest.ma",
  description:
    "Politique de confidentialité Fitnest.ma : données personnelles, commandes et livraison de repas au Maroc. Transparence sur l'utilisation de vos informations.",
}

export default function PrivacyLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
