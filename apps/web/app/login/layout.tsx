import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Connexion | Fitnest.ma",
  description:
    "Connectez-vous à votre compte Fitnest.ma pour gérer abonnements, commandes et livraisons de repas sains à domicile au Maroc. Accès sécurisé.",
}

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
