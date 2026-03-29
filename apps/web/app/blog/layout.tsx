import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Blog nutrition et bien-être | Fitnest.ma",
  description:
    "Conseils nutrition, recettes saines et actualités sur la livraison de repas au Maroc. Le blog Fitnest.ma pour une alimentation équilibrée au quotidien.",
}

export default function BlogLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
