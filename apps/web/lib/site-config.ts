/**
 * Single source of truth for SEO / GEO metadata.
 * Update here and it propagates to metadata, sitemap and structured data.
 */
export const siteConfig = {
  name: "FitNest",
  // Canonical production host. Deliberately NOT read from NEXT_PUBLIC_APP_URL:
  // on Vercel that resolves to the *.vercel.app preview domain, which would
  // leak into robots.txt, the sitemap and every canonical tag.
  url: "https://www.fitnest.ma",
  email: "contact@fitnest.ma",
  phone: "+212-6-00-00-00-00",

  city: "Casablanca",
  region: "Casablanca-Settat",
  geo: { lat: 33.5731, lng: -7.5898 },

  // Every city you deliver to - each one is a local-SEO surface.
  areaServed: ["Casablanca", "Mohammedia", "Bouskoura", "Dar Bouazza", "Rabat"],

  social: [
    "https://www.instagram.com/fitnest.ma",
    "https://www.facebook.com/fitnest.ma",
  ],

  plans: [
    { slug: "weight-loss", name: "Weight Loss" },
    { slug: "stay-fit", name: "Stay Fit" },
    { slug: "muscle-gain", name: "Muscle Gain" },
  ],

  descriptionFr:
    "Livraison de repas sains et équilibrés à Casablanca. Plans repas perte de poids, maintien et prise de masse, avec macros affichées et livraison quotidienne.",
  descriptionEn:
    "Healthy meal delivery in Casablanca, Morocco. Weight loss, maintenance and muscle gain meal plans with macros on every meal and daily delivery.",
} as const

/**
 * Canonical + hreflang for a page.
 * French is the default and lives at the root; English is served from /en.
 */
export function enPath(path: string) {
  return path === "/" ? "/en" : `/en${path}`
}

export function buildAlternates(path: string, locale: "fr" | "en" = "fr") {
  const base = siteConfig.url
  const fr = `${base}${path}`
  const en = `${base}${enPath(path)}`
  return {
    canonical: locale === "en" ? en : fr,
    languages: {
      "fr-MA": fr,
      fr,
      en,
      "x-default": fr,
    },
  }
}