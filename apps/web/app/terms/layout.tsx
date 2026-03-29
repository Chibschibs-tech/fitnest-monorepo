import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Conditions générales | Fitnest.ma",
  description:
    "CGU Fitnest.ma : abonnements repas, livraison au Maroc, compte client et responsabilités. Conditions d'utilisation du service de livraison de repas sains.",
}

export default function TermsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
