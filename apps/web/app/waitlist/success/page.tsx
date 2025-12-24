"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Clock, Gift, ArrowRight } from "lucide-react"
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
    <div className="min-h-screen bg-gradient-to-br from-fitnest-green/5 to-fitnest-orange/5 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full shadow-2xl border-0">
        <CardContent className="p-8 sm:p-12 text-center">
          <div className="w-20 h-20 bg-fitnest-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-fitnest-green" />
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {locale === "fr" ? "Bienvenue sur la liste d'attente ! 🎉" : "Welcome to the Waitlist! 🎉"}
          </h1>

          <p className="text-base sm:text-lg text-gray-600 mb-8">
            {locale === "fr" 
              ? "Vous êtes officiellement sur la liste d'attente exclusive Fitnest.ma. Nous vous notifierons dès qu'une place se libère !"
              : "You're officially on the Fitnest.ma exclusive waitlist. We'll notify you as soon as a spot opens up!"}
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-fitnest-orange/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="h-6 w-6 text-fitnest-orange" />
              </div>
              <h3 className="font-semibold mb-1 text-gray-900">
                {locale === "fr" ? "Temps d'attente moyen" : "Average Wait"}
              </h3>
              <p className="text-sm text-gray-600">
                {locale === "fr" ? "5 jours" : "5 days"}
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-fitnest-green/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Gift className="h-6 w-6 text-fitnest-green" />
              </div>
              <h3 className="font-semibold mb-1 text-gray-900">
                {locale === "fr" ? "Vos avantages" : "Your Benefits"}
              </h3>
              <p className="text-sm text-gray-600">
                {locale === "fr" ? "20% de réduction" : "20% off"}
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-fitnest-orange/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-fitnest-orange" />
              </div>
              <h3 className="font-semibold mb-1 text-gray-900">
                {locale === "fr" ? "Prochaines étapes" : "Next Steps"}
              </h3>
              <p className="text-sm text-gray-600">
                {locale === "fr" ? "Nous vous enverrons un email" : "We'll email you"}
              </p>
            </div>
          </div>

          <div className="bg-fitnest-green/5 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-fitnest-green mb-3">
              {locale === "fr" ? "Que se passe-t-il ensuite ?" : "What happens next?"}
            </h3>
            <ul className="text-sm text-gray-700 space-y-2 text-left">
              <li>✅ {locale === "fr" ? "Vous recevrez un email de confirmation sous peu" : "You'll receive a confirmation email shortly"}</li>
              <li>📧 {locale === "fr" ? "Nous vous notifierons lorsqu'une place s'ouvre (généralement 5 jours)" : "We'll notify you when a spot opens (usually 5 days)"}</li>
              <li>⏰ {locale === "fr" ? "Vous aurez 48 heures pour confirmer votre abonnement" : "You'll have 48 hours to confirm your subscription"}</li>
              <li>🎁 {locale === "fr" ? "Vos avantages exclusifs seront automatiquement appliqués" : "Your exclusive benefits will be automatically applied"}</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button
                variant="outline"
                className="border-fitnest-green text-fitnest-green hover:bg-fitnest-green hover:text-white w-full sm:w-auto"
              >
                {locale === "fr" ? "Retour à l'accueil" : "Back to Home"}
              </Button>
            </Link>
            <Link href="/blog">
              <Button className="bg-fitnest-green hover:bg-fitnest-green/90 text-white w-full sm:w-auto">
                {locale === "fr" ? "Lire les conseils nutrition" : "Read Nutrition Tips"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
