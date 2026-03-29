import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Check } from "lucide-react"

export const metadata: Metadata = {
  title: "Nos Formules | Fitnest.ma — Plans Repas Sains Livrés à Domicile",
  description:
    "Découvrez nos formules repas : Weight Loss, Stay Fit, Muscle Gain et Keto. Plans personnalisés, livrés frais chez vous au Maroc. À partir de 420 MAD/semaine.",
  openGraph: {
    title: "Nos Formules | Fitnest.ma",
    description: "Plans repas sains et personnalisés, livrés frais à domicile au Maroc.",
    url: "https://fitnest.ma/plans",
  },
}

const PLANS = [
  {
    key: "weight-loss",
    title: "Weight Loss",
    subtitle: "Objectif perte de poids",
    description: "Repas contrôlés en calories (1200-1500 kcal/jour) pour perdre du poids tout en restant rassasié.",
    price: "420",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=400&fit=crop",
    features: [
      "Glucides réduits",
      "Riche en protéines",
      "Index glycémique bas",
      "Contrôle du poids",
    ],
  },
  {
    key: "stay-fit",
    title: "Stay Fit",
    subtitle: "Rester en forme au quotidien",
    description: "Repas équilibrés (1600-1900 kcal/jour) avec une répartition optimale des macronutriments.",
    price: "450",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop",
    features: [
      "Équilibre nutritionnel",
      "Riche en nutriments",
      "Adapté au quotidien",
      "Durable et satisfaisant",
    ],
    popular: true,
  },
  {
    key: "muscle-gain",
    title: "Muscle Gain",
    subtitle: "Prise de masse maîtrisée",
    description: "Repas riches en protéines (2200-2500 kcal/jour) pour la croissance musculaire et la récupération.",
    price: "500",
    image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=400&fit=crop",
    features: [
      "Haute teneur en protéines",
      "Récupération post-entraînement",
      "Glucides complexes",
      "Performance optimale",
    ],
  },
  {
    key: "keto",
    title: "Keto",
    subtitle: "Régime cétogène",
    description: "Repas faibles en glucides et riches en lipides sains (1700-1900 kcal/jour) pour la cétose.",
    price: "480",
    image: "https://images.unsplash.com/photo-1607532941433-304659e8198a?w=400&h=400&fit=crop",
    features: [
      "Très faible en glucides",
      "Riche en bons lipides",
      "Maintien de la cétose",
      "Énergie stable",
    ],
  },
]

export default function PlansPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <header className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-fitnest-green mb-3">
            Nos Formules
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg">
            Choisissez la formule adaptée à vos objectifs, puis configurez vos jours, repas et calendrier de livraison.
          </p>
        </header>

        <section className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
          {PLANS.map((plan) => (
            <article
              key={plan.key}
              className={`rounded-2xl bg-white p-6 sm:p-8 flex flex-col shadow-md hover:shadow-xl transition-shadow relative ${
                plan.popular ? "border-2 border-fitnest-orange ring-1 ring-fitnest-orange/20" : "border border-gray-200"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-fitnest-orange text-white text-xs font-semibold px-4 py-1 rounded-full">
                  POPULAIRE
                </span>
              )}

              <div className="flex justify-center mb-5">
                <div className="relative w-28 h-28 rounded-full overflow-hidden">
                  <Image src={plan.image} alt={plan.title} fill className="object-cover" sizes="112px" />
                </div>
              </div>

              <h2 className="text-xl font-bold text-fitnest-green text-center">{plan.title}</h2>
              <p className="text-sm text-gray-500 text-center mb-2">{plan.subtitle}</p>
              <p className="text-xs text-gray-600 text-center mb-4 leading-relaxed">{plan.description}</p>

              <div className="text-center mb-5">
                <span className="text-[10px] text-gray-500">à partir de </span>
                <span className="text-xl font-bold text-fitnest-green">{plan.price} MAD</span>
                <span className="text-xs text-gray-500"> / semaine</span>
              </div>

              <Link
                href={`/order?plan=${plan.key}`}
                className={`w-full rounded-full px-4 py-2.5 text-sm font-medium text-center transition-colors mb-5 block ${
                  plan.popular
                    ? "bg-fitnest-orange text-white hover:bg-fitnest-orange/90"
                    : "bg-gray-100 text-fitnest-green hover:bg-gray-200"
                }`}
              >
                Configurer cette formule
              </Link>

              <ul className="space-y-2.5 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start text-sm text-gray-600">
                    <Check className="h-4 w-4 text-fitnest-orange mr-2 flex-shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}
