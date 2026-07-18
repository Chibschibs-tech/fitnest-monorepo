import type { Metadata } from "next"
import { headers } from "next/headers"
import { Composer } from "./composer"
import { composeCopy } from "@/lib/compose-i18n"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Compose ton plan | Fitnest.ma",
  description:
    "Compose tes plats au gramme pres : choisis ta protéine, ton féculent, tes légumes et tes suppléments, suis tes macros en direct et monte ton plan de la semaine.",
}

export default function ComposeTonPlanPage() {
  // Locale comes from middleware, not usePathname(): the /en prefix is
  // rewritten away, so the client router may not see it.
  const locale = headers().get("x-locale") === "en" ? "en" : "fr"
  const T = composeCopy[locale]
  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <header className="mb-8 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{T.title}</h1>
        <p className="text-gray-600">
          {T.intro}
        </p>
      </header>
      <Composer locale={locale} />
    </main>
  )
}