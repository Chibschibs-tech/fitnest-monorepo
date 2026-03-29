import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Créer un compte | Fitnest.ma",
  description:
    "Inscrivez-vous sur Fitnest.ma pour commander des repas équilibrés livrés à domicile au Maroc. Création de compte rapide pour la livraison de plats sains.",
}

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
