import type { Metadata } from "next"
import { Composer } from "./composer"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Compose ton plan | Fitnest.ma",
  description:
    "Compose tes plats au gramme pres : choisis ta protéine, ton féculent, tes légumes et tes suppléments, suis tes macros en direct et monte ton plan de la semaine.",
}

export default function ComposeTonPlanPage() {
  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <header className="mb-8 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Compose ton plan</h1>
        <p className="text-gray-600">
          Ton plan sur mesure, composé au gramme près. Construis chaque plat, suis tes calories et
          tes macros en direct, enregistre-le sous le nom que tu veux, puis choisis combien de fois
          tu le veux dans ta semaine.
        </p>
      </header>
      <Composer />
    </main>
  )
}