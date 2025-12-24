"use client"

import { Button } from "@/components/ui/button"
import { UtensilsCrossed, ChefHat, Truck, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/components/language-provider"
import { getTranslations, defaultLocale } from "@/lib/i18n"
import { useState, useEffect } from "react"

export default function WaitlistSuccessPage() {
  const { locale } = useLanguage()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const t = getTranslations(mounted ? locale : defaultLocale)

  return (
    <div className="min-h-screen bg-gradient-to-br from-fitnest-green/10 via-white to-fitnest-orange/10 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        {/* Success Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-fitnest-green mb-4">
            {locale === "fr" ? "Bienvenue sur la waitlist ! 🎉" : "Welcome to the Waitlist! 🎉"}
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto">
            {locale === "fr" 
              ? "Vous êtes officiellement sur la waitlist exclusive Fitnest.ma. Nous vous notifierons dès qu'une place se libère !"
              : "You're officially on the Fitnest.ma exclusive waitlist. We'll notify you as soon as a spot opens up!"}
          </p>
        </div>

        {/* Info Cards - Fitnest Style */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-fitnest-orange/20 hover:border-fitnest-orange/40 transition-all">
            <div className="w-14 h-14 bg-fitnest-orange/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <UtensilsCrossed className="h-7 w-7 text-fitnest-orange" strokeWidth={2.5} />
            </div>
            <h3 className="font-bold text-lg mb-2 text-gray-900 text-center">
              {locale === "fr" ? "Temps d'attente moyen" : "Average Wait"}
            </h3>
            <p className="text-2xl font-bold text-fitnest-orange text-center">
              {locale === "fr" ? "5 jours" : "5 days"}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-fitnest-green/20 hover:border-fitnest-green/40 transition-all">
            <div className="w-14 h-14 bg-fitnest-green/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <ChefHat className="h-7 w-7 text-fitnest-green" strokeWidth={2.5} />
            </div>
            <h3 className="font-bold text-lg mb-2 text-gray-900 text-center">
              {locale === "fr" ? "Vos avantages" : "Your Benefits"}
            </h3>
            <p className="text-2xl font-bold text-fitnest-green text-center">
              {locale === "fr" ? "20% de réduction" : "20% off"}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-fitnest-orange/20 hover:border-fitnest-orange/40 transition-all">
            <div className="w-14 h-14 bg-fitnest-orange/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Truck className="h-7 w-7 text-fitnest-orange" strokeWidth={2.5} />
            </div>
            <h3 className="font-bold text-lg mb-2 text-gray-900 text-center">
              {locale === "fr" ? "Prochaines étapes" : "Next Steps"}
            </h3>
            <p className="text-sm text-gray-600 text-center">
              {locale === "fr" ? "Nous vous enverrons un email" : "We'll email you"}
            </p>
          </div>
        </div>

        {/* What Happens Next - Fitnest Style */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <h3 className="font-bold text-xl text-fitnest-green mb-6 text-center">
            {locale === "fr" ? "Que se passe-t-il ensuite ?" : "What happens next?"}
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-fitnest-green/5 rounded-xl">
              <div className="w-8 h-8 bg-fitnest-green rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">✓</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm mb-1">
                  {locale === "fr" ? "Email de confirmation" : "Confirmation Email"}
                </p>
                <p className="text-xs text-gray-600">
                  {locale === "fr" ? "Vous recevrez un email sous peu" : "You'll receive an email shortly"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-fitnest-orange/5 rounded-xl">
              <div className="w-8 h-8 bg-fitnest-orange rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">📧</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm mb-1">
                  {locale === "fr" ? "Notification" : "Notification"}
                </p>
                <p className="text-xs text-gray-600">
                  {locale === "fr" ? "Quand une place s'ouvre (5 jours)" : "When a spot opens (5 days)"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-fitnest-green/5 rounded-xl">
              <div className="w-8 h-8 bg-fitnest-green rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">⏰</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm mb-1">
                  {locale === "fr" ? "Confirmation" : "Confirmation"}
                </p>
                <p className="text-xs text-gray-600">
                  {locale === "fr" ? "48h pour confirmer votre abonnement" : "48h to confirm your subscription"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-fitnest-orange/5 rounded-xl">
              <div className="w-8 h-8 bg-fitnest-orange rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">🎁</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm mb-1">
                  {locale === "fr" ? "Avantages appliqués" : "Benefits Applied"}
                </p>
                <p className="text-xs text-gray-600">
                  {locale === "fr" ? "Automatiquement appliqués" : "Automatically applied"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button
              variant="outline"
              className="border-2 border-fitnest-green text-fitnest-green hover:bg-fitnest-green hover:text-white w-full sm:w-auto rounded-full px-8 py-6 text-base font-semibold"
            >
              {locale === "fr" ? "Retour à l'accueil" : "Back to Home"}
            </Button>
          </Link>
          <Link href="/blog">
            <Button className="bg-fitnest-green hover:bg-fitnest-green/90 text-white w-full sm:w-auto rounded-full px-8 py-6 text-base font-semibold shadow-lg">
              {locale === "fr" ? "Lire les conseils nutrition" : "Read Nutrition Tips"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
