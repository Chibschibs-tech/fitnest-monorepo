"use client"

import { useLanguage, localePath } from "./language-provider"
import { getTranslations } from "@/lib/i18n"

export default function Footer() {
  const { locale } = useLanguage()
  const t = getTranslations(locale)
  const L = (href: string) => localePath(href, locale)

  const nav = [
    { href: "/plans", label: t.nav.mealPlans },
    { href: "/menu", label: t.nav.meals },
    { href: "/compose-ton-plan", label: t.nav.compose },
    { href: "/entreprises", label: t.nav.business },
    { href: "/catalogue", label: t.nav.howItWorks },
    { href: "/subscribe", label: t.nav.subscribe },
  ]

  const legal =
    locale === "fr"
      ? [
          { href: "/terms", label: "CGU" },
          { href: "/privacy", label: "Confidentialité" },
          { href: "/legal", label: "Mentions légales" },
        ]
      : [
          { href: "/terms", label: "Terms" },
          { href: "/privacy", label: "Privacy" },
          { href: "/legal", label: "Legal notice" },
        ]

  return (
    <footer className="border-t bg-white">
      <div className="container grid gap-6 py-8 md:grid-cols-3">
        <div>
          <div className="text-lg font-bold mb-2">Fitnest</div>
          <p className="text-sm text-gray-600">
            {locale === "fr"
              ? "Repas sains livrés, adaptés à vos objectifs."
              : "Healthy meals delivered, built around your goals."}
          </p>
        </div>
        <div>
          <div className="font-semibold">Navigation</div>
          <div className="grid grid-cols-2 gap-2 text-sm mt-2">
            {nav.map((n) => (
              <a
                key={n.href}
                href={L(n.href)}
                className="inline-flex min-h-[44px] items-center text-gray-700 hover:text-fitnest-green"
              >
                {n.label}
              </a>
            ))}
          </div>
        </div>
        <div>
          <div className="font-semibold">{locale === "fr" ? "Légal" : "Legal"}</div>
          <div className="grid gap-2 text-sm mt-2">
            {legal.map((n) => (
              <a
                key={n.href}
                href={L(n.href)}
                className="inline-flex min-h-[44px] items-center text-gray-700 hover:text-fitnest-green"
              >
                {n.label}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t">
        <div className="container py-3 text-xs text-gray-500">© {new Date().getFullYear()} Fitnest</div>
      </div>
    </footer>
  )
}
