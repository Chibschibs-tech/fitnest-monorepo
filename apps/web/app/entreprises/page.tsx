import type { Metadata } from "next"
import { CheckCircle, Building2, PartyPopper, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LeadForm } from "./lead-form"

export const metadata: Metadata = {
  title: "FitNest Entreprises | Buffets healthy & déjeuners pour vos équipes",
  description:
    "Buffets healthy pour vos événements et plans repas quotidiens pour vos collaborateurs, adaptés à votre entreprise. Livraison groupée, macros affichées, cuisine agréée ONSSA.",
}

const WHATSAPP_URL = "https://wa.me/212600000000?text=Bonjour%20FitNest%2C%20je%20souhaite%20une%20offre%20entreprise"

const EVENTS_POINTS = [
  "À partir de 15 personnes",
  "Formules par personne, menu adapté à votre événement",
  "Options végétariennes / sans gluten",
]

const CORPORATE_POINTS = [
  "Comptes employés + menu personnalisé pour l'entreprise",
  "Une seule livraison groupée par jour au bureau",
  "Facturation flexible : entreprise, employé, ou participation partagée",
  "Tarifs dégressifs selon le nombre de collaborateurs",
]

const STEPS = [
  "On définit ensemble le menu et la formule",
  "Vos collaborateurs reçoivent leurs accès",
  "Ils commandent avant 20h pour le lendemain",
  "Livraison groupée au bureau à l'heure du déjeuner",
]

const WHY = [
  "Repas frais cuisinés le jour même",
  "Macros affichées sur chaque repas",
  "Un seul interlocuteur",
  "Zéro logistique pour vous",
]

export default function EntreprisesPage() {
  return (
    <main className="bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-r from-fitnest-green to-green-600 text-white">
        <div className="container mx-auto px-4 py-14 md:py-20 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">La santé de vos équipes, livrée.</h1>
          <p className="text-base md:text-xl text-green-50 max-w-3xl mx-auto mb-8">
            Buffets healthy pour vos événements, déjeuners quotidiens pour vos collaborateurs —
            adaptés à votre entreprise.
          </p>
          <Button asChild size="lg" className="bg-fitnest-orange hover:bg-orange-600 text-white rounded-full">
            <a href="#demande">Demander une offre</a>
          </Button>
        </div>
      </section>

      {/* Les deux segments */}
      <section className="container mx-auto px-4 py-10 md:py-14">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Deux façons de travailler avec nous</h2>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            Un événement ponctuel, ou les déjeuners quotidiens de vos équipes — on s'adapte à votre besoin.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 max-w-5xl mx-auto">
          {/* Segment 1 — Événementiel */}
          <article className="flex flex-col rounded-2xl border-2 border-fitnest-orange/30 bg-white p-5 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-fitnest-orange/10">
                <PartyPopper className="h-6 w-6 text-fitnest-orange" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide text-fitnest-orange">
                Événementiel · ponctuel
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2">FitNest Events — Buffets &amp; événements</h3>
            <p className="text-gray-600 text-sm mb-4">
              Séminaire, team building, journée bien-être, afterwork : un buffet healthy, généreux et
              macro-conscient. Wraps, bowls, salades, energy balls, jus détox — présenté, livré et installé.
            </p>
            <ul className="space-y-2 mb-6 flex-1">
              {EVENTS_POINTS.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-fitnest-orange mt-0.5 flex-shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <Button asChild className="w-full rounded-full bg-fitnest-orange hover:bg-orange-600 text-white">
              <a href="#demande">Demander un devis événement</a>
            </Button>
          </article>

          {/* Segment 2 — Abonnement équipes */}
          <article className="flex flex-col rounded-2xl border-2 border-fitnest-green/30 bg-white p-5 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-fitnest-green/10">
                <Building2 className="h-6 w-6 text-fitnest-green" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide text-fitnest-green">
                Abonnement · déjeuners d'équipe
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2">FitNest Corporate — Le déjeuner de vos équipes</h3>
            <p className="text-gray-600 text-sm mb-4">
              Vos collaborateurs commandent chaque matin leur déjeuner depuis leur compte FitNest, sur un
              menu dédié à votre entreprise. Livraison groupée à vos bureaux, chaque jour.
            </p>
            <ul className="space-y-2 mb-6 flex-1">
              {CORPORATE_POINTS.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-fitnest-green mt-0.5 flex-shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <Button asChild className="w-full rounded-full bg-fitnest-green hover:bg-fitnest-green/90 text-white">
              <a href="#demande">Mettre en place pour mon équipe</a>
            </Button>
          </article>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="bg-white border-y">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <h2 className="text-2xl font-bold text-center mb-8">Comment ça marche</h2>
          <ol className="grid gap-6 grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s} className="text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-fitnest-green text-white font-semibold">
                  {i + 1}
                </div>
                <p className="text-sm text-gray-700">{s}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Pourquoi FitNest + confiance */}
      <section className="container mx-auto px-4 py-10 md:py-14">
        <h2 className="text-2xl font-bold text-center mb-8">Pourquoi FitNest</h2>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8">
          {WHY.map((w) => (
            <div key={w} className="rounded-lg border bg-white p-4 text-center text-sm text-gray-700">
              {w}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-3 rounded-lg bg-fitnest-green/5 border border-fitnest-green/20 p-4">
          <ShieldCheck className="h-5 w-5 text-fitnest-green" />
          <p className="text-sm font-medium text-gray-800">Cuisine agréée ONSSA</p>
        </div>
      </section>

      {/* Formulaire */}
      <section id="demande" className="container mx-auto px-4 pb-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-2">Demander une offre</h2>
          <p className="text-center text-gray-600 mb-6">
            Dites-nous votre besoin, nous revenons vers vous sous 24h ouvrées.
          </p>
          <LeadForm whatsappUrl={WHATSAPP_URL} />
        </div>
      </section>
    </main>
  )
}
