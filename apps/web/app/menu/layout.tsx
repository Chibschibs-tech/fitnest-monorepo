import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Menu des repas | Fitnest.ma",
  description:
    "Parcourez le menu hebdomadaire Fitnest.ma : repas équilibrés, calories et macros, ingrédients frais. Livraison de plats sains au Maroc.",
}

export default function MenuLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
