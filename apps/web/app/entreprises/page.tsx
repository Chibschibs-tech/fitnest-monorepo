import type { Metadata } from "next"
import { CheckCircle, Building2, PartyPopper, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LeadForm } from "./lead-form"

export const metadata: Metadata = {
  title: "FitNest Entreprises | Buffets healthy & dejeuners pour vos equipes",
  description:
    "Buffets healthy pour vos evenements et plans repas quotidiens pour vos collaborateurs, adaptes a votre entreprise. Livraison groupee, macros affichees, cuisine agreee ONSSA.",
}

const WHATSAPP_URL = "https://wa.me/212600000000?text=Bonjour%20FitNest%2C%20je%20souhaite%20une%20offre%20entreprise"

const EVENTS_POINTS = [
  "A partir de 15 personnes",
  "Formules par personne, menu adapte a votre evenement",
  "Options vegetariennes / sans gluten",
]

const CORPORATE_POINTS = [
  "Comptes employes + menu personnalise pour l'entreprise",
  "Une seule livraison groupee par jour au bureau",
  "Facturation flexible : entreprise, employe, ou participation partagee",
  "Tarifs degressifs selon le nombre de collaborateurs",
]

const STEPS = [
  "On definit ensemble le menu et la formule",
  "Vos collaborateurs recoivent leurs acces",
  "Ils commandent avant 20h pour le lendemain",
  "Livraison groupee au bureau a l'heure du dejeuner",
]

const WHY = [
  "Repas frais cuisines le jour meme",
  "Macros affichees sur chaque repas",
  "Un seul interlocuteur",
  "Zero logistique pour vous",
]

export default function EntreprisesPage() {
  return (
    <main className="bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-r from-fitnest-green to-green-600 text-white">
        <div className="container mx-auto px-4 py-16 md:py-20 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">La sante de vos equipes, livree.</h1>
          <p className="text-lg md:text-xl text-green-50 max-w-3xl mx-auto mb-8">
            Buffets healthy pour vos evenements, plans repas quotidiens pour vos collaborateurs -
            adaptes a votre entreprise.
          </p>
          <Button asChild size="lg" className="bg-fitnest-orange hover:bg-orange-600 text-white">
            <a href="#demande">Demander une offre</a>
          </Button>
        </div>
      </section>

      {/* Les deux offres */}
      <section className="container mx-auto px-4 py-14">
        <div className="grid gap-6 md:grid-cols-2">
          <article className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <PartyPopper className="h-6 w-6 text-fitnest-orange" />
              <h2 className="text-xl font-semibold">FitNest Events - Buffets &amp; evenements</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Seminaire, team building, journee bien-etre, afterwork : un buffet healthy, genereux et
              macro-conscient. Wraps, bowls, salades, energy balls, jus detox - presente, livre et installe.
            </p>
            <ul className="space-y-2">
              {EVENTS_POINTS.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-fitnest-green mt-0.5 flex-shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <Building2 className="h-6 w-6 text-fitnest-green" />
              <h2 className="text-xl font-semibold">FitNest Corporate - Le dejeuner de vos equipes</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Vos collaborateurs commandent chaque matin leur dejeuner depuis leur compte FitNest, sur un
              menu dedie a votre entreprise. Livraison groupee a vos bureaux, chaque jour.
            </p>
            <ul className="space-y-2">
              {CORPORATE_POINTS.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-fitnest-green mt-0.5 flex-shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      {/* Comment ca marche */}
      <section className="bg-white border-y">
        <div className="container mx-auto px-4 py-14">
          <h2 className="text-2xl font-bold text-center mb-10">Comment ca marche</h2>
          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
      <section className="container mx-auto px-4 py-14">
        <h2 className="text-2xl font-bold text-center mb-8">Pourquoi FitNest</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          {WHY.map((w) => (
            <div key={w} className="rounded-lg border bg-white p-4 text-center text-sm text-gray-700">
              {w}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-3 rounded-lg bg-fitnest-green/5 border border-fitnest-green/20 p-4">
          <ShieldCheck className="h-5 w-5 text-fitnest-green" />
          <p className="text-sm font-medium text-gray-800">Cuisine agreee ONSSA</p>
        </div>
      </section>

      {/* Formulaire */}
      <section id="demande" className="container mx-auto px-4 pb-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-2">Demander une offre</h2>
          <p className="text-center text-gray-600 mb-6">
            Dites-nous votre besoin, nous revenons vers vous sous 24h ouvrees.
          </p>
          <LeadForm whatsappUrl={WHATSAPP_URL} />
        </div>
      </section>
    </main>
  )
}
