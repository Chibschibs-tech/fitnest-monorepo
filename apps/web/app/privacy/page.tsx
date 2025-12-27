"use client"

import { useLanguage } from "@/components/language-provider"
import { getTranslations } from "@/lib/i18n"
import { Card, CardContent } from "@/components/ui/card"

export default function PrivacyPage() {
  const { locale } = useLanguage()
  const t = getTranslations(locale)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">
            {t.legal.privacy.title}
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mb-8 sm:mb-12 text-center">
            {t.legal.privacy.lastUpdated}: {new Date().toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="space-y-6 sm:space-y-8">
            {/* Introduction */}
            <Card className="border-0 shadow-md">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-fitnest-green mb-4 sm:mb-6">
                  {t.legal.privacy.introduction.title}
                </h2>
                <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-700 leading-relaxed">
                  <p>{t.legal.privacy.introduction.content1}</p>
                  <p>{t.legal.privacy.introduction.content2}</p>
                </div>
              </CardContent>
            </Card>

            {/* Information We Collect */}
            <Card className="border-0 shadow-md">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-fitnest-green mb-4 sm:mb-6">
                  {t.legal.privacy.information.title}
                </h2>
                <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6">
                  {t.legal.privacy.information.intro}
                </p>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                    {t.legal.privacy.information.personal.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">
                    {t.legal.privacy.information.personal.content}
                  </p>
                  <ul className="list-disc list-inside space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-700 ml-4">
                    {t.legal.privacy.information.personal.items.map((item: string, index: number) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="border-0 shadow-md bg-fitnest-green/5">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-fitnest-green mb-4 sm:mb-6">
                  {t.legal.privacy.contact.title}
                </h2>
                <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6">
                  {t.legal.privacy.contact.intro}
                </p>
                <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-700">
                  <p><strong>{t.legal.privacy.contact.email}</strong></p>
                  <p><strong>{t.legal.privacy.contact.phone}</strong></p>
                  <p><strong>{t.legal.privacy.contact.address}</strong></p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
