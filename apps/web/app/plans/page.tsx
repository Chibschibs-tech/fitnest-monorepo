import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Plans Overview | Fitnest.ma",
  description:
    "Overview of Fitnest meal plans. Compare Weight Loss, Stay Fit, and Muscle Gain programs, then choose a plan to subscribe.",
}

const PLANS = [
  { key: "Weight Loss", title: "Weight Loss", desc: "Objectif perte de poids" },
  { key: "Stay Fit", title: "Stay Fit", desc: "Rester en forme au quotidien" },
  { key: "Muscle Gain", title: "Muscle Gain", desc: "Prise de masse maîtrisée" },
]

export default function PlansPage() {
  return (
    <main className="container px-4 py-10 space-y-8">
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Nos formules</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Choisissez la formule adaptée à vos objectifs, puis configurez vos jours par semaine et vos repas par jour.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        {PLANS.map((p) => (
          <article
            key={p.key}
            className="rounded-xl border bg-white p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
          >
            <div>
              <h3 className="text-lg font-semibold mb-1">{p.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{p.desc}</p>
              <p className="text-xs text-gray-500">
                Basé sur nos catégories MP, avec des variantes de plan et des prix en MAD selon la durée et les repas/jour.
              </p>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <a
                href={`/subscribe?plan=${encodeURIComponent(p.key)}`}
                className="inline-flex items-center justify-center rounded-full bg-fitnest-green px-4 py-2 text-sm font-medium text-white hover:bg-fitnest-green/90"
              >
                Configurer cette formule
              </a>
              <Link
                href="/meal-plans"
                className="inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm hover:border-fitnest-green hover:text-fitnest-green"
              >
                Voir tous les plans repas
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}
