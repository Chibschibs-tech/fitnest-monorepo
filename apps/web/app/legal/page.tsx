"use client"

import { useLanguage } from "@/components/language-provider"
import { getTranslations } from "@/lib/i18n"
import { Card, CardContent } from "@/components/ui/card"

export default function LegalPage() {
  const { locale } = useLanguage()
  const t = getTranslations(locale)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
            {t.legal.legalMentions.title}
          </h1>

          <div className="space-y-6 sm:space-y-8">
            {/* Company Information */}
            <Card className="border-0 shadow-md">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-fitnest-green mb-4 sm:mb-6">
                  {t.legal.legalMentions.company.title}
                </h2>
                <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-700">
                  <p><strong>{t.legal.legalMentions.company.name}</strong></p>
                  <p><strong>{t.legal.legalMentions.company.address}</strong></p>
                  <p><strong>{t.legal.legalMentions.company.phone}</strong></p>
                  <p><strong>{t.legal.legalMentions.company.email}</strong></p>
                </div>
              </CardContent>
            </Card>

            {/* Publication Director */}
            <Card className="border-0 shadow-md">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-fitnest-green mb-4 sm:mb-6">
                  {t.legal.legalMentions.publication.title}
                </h2>
                <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-700">
                  <p><strong>{t.legal.legalMentions.publication.name}</strong></p>
                  <p><strong>{t.legal.legalMentions.publication.role}</strong></p>
                </div>
              </CardContent>
            </Card>

            {/* Hosting */}
            <Card className="border-0 shadow-md">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-fitnest-green mb-4 sm:mb-6">
                  {t.legal.legalMentions.hosting.title}
                </h2>
                <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-700">
                  <p><strong>{t.legal.legalMentions.hosting.provider}</strong></p>
                  <p><strong>{t.legal.legalMentions.hosting.address}</strong></p>
                </div>
              </CardContent>
            </Card>

            {/* Intellectual Property */}
            <Card className="border-0 shadow-md">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-fitnest-green mb-4 sm:mb-6">
                  {t.legal.legalMentions.intellectual.title}
                </h2>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  {t.legal.legalMentions.intellectual.content}
                </p>
              </CardContent>
            </Card>

            {/* Limitation of Liability */}
            <Card className="border-0 shadow-md">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-fitnest-green mb-4 sm:mb-6">
                  {t.legal.legalMentions.liability.title}
                </h2>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  {t.legal.legalMentions.liability.content}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}

