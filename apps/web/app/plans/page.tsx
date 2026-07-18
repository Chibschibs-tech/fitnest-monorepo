import type { Metadata } from "next"
import Link from "next/link"
import { getPlanEntryPrices, ENTRY_DAYS, ENTRY_MEALS } from "@/lib/plan-pricing"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Plans Overview | Fitnest.ma",
  description:
    "Overview of Fitnest meal plans. Compare Weight Loss, Stay Fit, and Muscle Gain programs, then choose a plan to subscribe.",
}

// `key` must match meal_type_prices.plan_name; `slug` is what /order expects.
const PLANS = [
  { key: "Weight Loss", slug: "weight-loss", title: "Weight Loss", desc: "Objectif perte de poids" },
  { key: "Stay Fit", slug: "stay-fit", title: "Stay Fit", desc: "Rester en forme au quotidien" },
  { key: "Muscle Gain", slug: "muscle-gain", title: "Muscle Gain", desc: "Prise de masse maitrisee" },
]

export default async function PlansPage() {
  // Prices come from the same engine that prices the builder and checkout,
  // so a card can never show a number the customer will not actually pay.
  const prices = await getPlanEntryPrices(PLANS.map((p) => p.key))

  return (
    <main className="container px-4 py-10 space-y-8">
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Nos formules</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Choisissez la formule adaptee a vos objectifs, puis configurez vos jours par semaine et vos repas par jour.
        </p>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {PLANS.map((p) => {
          const price = prices[p.key]
          return (
            <article
              key={p.key}
              className="rounded-xl border bg-white p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                <h3 className="text-lg font-semibold mb-1">{p.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{p.desc}</p>

                {price ? (
                  <div className="mb-4">
                    <p className="text-2xl font-bold text-fitnest-green">
                      {price.weekly.toFixed(2)}{" "}
                      <span className="text-sm font-normal text-gray-600">MAD / semaine</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      A partir de - {ENTRY_MEALS.length} repas/jour, {ENTRY_DAYS} jours/semaine
                    </p>
                    <p className="text-xs text-gray-500">
                      soit {price.pricePerDay.toFixed(2)} MAD / jour
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 mb-4">
                    Prix calcule lors de la configuration de votre formule.
                  </p>
                )}
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <a
                  href={`/order?plan=${p.slug}`}
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
          )
        })}
      </section>
    </main>
  )
}
