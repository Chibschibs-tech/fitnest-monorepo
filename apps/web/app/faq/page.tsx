import type { Metadata } from "next"
import { headers } from "next/headers"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "FAQ - Fitnest.ma",
  description: "Questions fréquentes sur le service de livraison de repas Fitnest.ma",
}

const CONTENT = {
  fr: {
    title: "Questions fréquentes",
    subtitle: "Trouvez les réponses aux questions courantes sur notre service de livraison de repas.",
    stillTitle: "Encore des questions ?",
    stillText: "Vous ne trouvez pas ce que vous cherchez ? Notre équipe est là pour vous aider.",
    contactCta: "Contacter le support",
    faqs: [
      { q: "Comment fonctionne la livraison de repas ?", a: "Nous préparons des repas sains et frais et les livrons à votre porte selon le rythme que vous choisissez. Vous pouvez personnaliser votre plan selon vos préférences alimentaires et vos objectifs." },
      { q: "Quelles zones desservez-vous ?", a: "Nous livrons actuellement partout au Maroc, dont les grandes villes comme Casablanca, Rabat, Marrakech et Fès. Les délais peuvent varier selon la zone." },
      { q: "Puis-je personnaliser mes repas ?", a: "Oui ! Vous pouvez choisir parmi plusieurs programmes — perte de poids, prise de masse, keto, nutrition équilibrée — et indiquer vos restrictions et préférences alimentaires." },
      { q: "Les repas sont-ils frais ?", a: "Tous les repas sont préparés frais chaque jour avec des ingrédients de qualité. Un emballage adapté préserve leur fraîcheur pendant la livraison." },
      { q: "Puis-je mettre en pause ou annuler mon abonnement ?", a: "Oui, vous pouvez mettre en pause ou annuler à tout moment depuis votre tableau de bord. Les changements s'appliquent au cycle de livraison suivant." },
      { q: "Quels moyens de paiement acceptez-vous ?", a: "Pour le moment, nous acceptons le paiement à la livraison. Le paiement par carte et mobile arrive bientôt." },
      { q: "Et si je ne suis pas satisfait d'un repas ?", a: "Votre satisfaction est notre priorité. Si un repas ne vous convient pas, contactez notre équipe et nous ferons le nécessaire." },
      { q: "Comment suivre ma commande ?", a: "Vous pouvez suivre vos commandes depuis votre tableau de bord et recevez aussi des notifications par e-mail sur leur statut." },
    ],
  },
  en: {
    title: "Frequently Asked Questions",
    subtitle: "Find answers to common questions about our meal delivery service.",
    stillTitle: "Still have questions?",
    stillText: "Can't find what you're looking for? Our support team is here to help.",
    contactCta: "Contact Support",
    faqs: [
      { q: "How does meal delivery work?", a: "We prepare fresh, healthy meals and deliver them to your doorstep according to your chosen schedule. You can customize your meal plan based on your dietary preferences and fitness goals." },
      { q: "What areas do you deliver to?", a: "We currently deliver throughout Morocco, including major cities like Casablanca, Rabat, Marrakech, and Fez. Delivery times may vary by location." },
      { q: "Can I customize my meals?", a: "Yes! You can choose from various meal plans including weight loss, muscle gain, keto, and balanced nutrition. You can also specify dietary restrictions and preferences." },
      { q: "How fresh are the meals?", a: "All meals are prepared fresh daily using high-quality ingredients. We use proper packaging to maintain freshness during delivery." },
      { q: "Can I pause or cancel my subscription?", a: "Yes, you can pause or cancel your subscription at any time through your dashboard. Changes take effect from the next delivery cycle." },
      { q: "What payment methods do you accept?", a: "Currently, we accept cash on delivery. We're working on adding credit card and mobile payment options soon." },
      { q: "What if I'm not satisfied with my meal?", a: "Customer satisfaction is our priority. If you're not happy with any meal, please contact our support team and we'll make it right." },
      { q: "How do I track my order?", a: "You can track your orders through your dashboard. You'll also receive email notifications about order status updates." },
    ],
  },
} as const

export default function FAQPage() {
  const locale = headers().get("x-locale") === "en" ? "en" : "fr"
  const T = CONTENT[locale]
  const contactHref = locale === "en" ? "/en/contact" : "/contact"

  return (
    <div className="container mx-auto px-4 py-10 md:py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3">{T.title}</h1>
        <p className="text-gray-600 text-center mb-8 md:mb-10">{T.subtitle}</p>

        <div className="space-y-4">
          {T.faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">{faq.q}</h3>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <h2 className="text-xl md:text-2xl font-semibold mb-3">{T.stillTitle}</h2>
          <p className="text-gray-600 mb-6">{T.stillText}</p>
          <a
            href={contactHref}
            className="inline-block bg-fitnest-green text-white px-6 py-3 rounded-full hover:bg-fitnest-green/90 transition-colors"
          >
            {T.contactCta}
          </a>
        </div>
      </div>
    </div>
  )
}
