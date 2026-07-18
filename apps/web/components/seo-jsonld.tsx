import { siteConfig } from "@/lib/site-config"

/**
 * Structured data for local + geo SEO.
 *
 * FoodEstablishment/LocalBusiness is what Google reads for "livraison repas
 * healthy Casablanca" style queries and for Maps/local packs. areaServed lists
 * the delivery cities so the business surfaces for each of them.
 */
export function LocalBusinessJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": ["FoodEstablishment", "LocalBusiness"],
    "@id": `${siteConfig.url}/#business`,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.descriptionFr,
    inLanguage: ["fr-MA", "en"],
    servesCuisine: ["Healthy", "Meal prep", "Fitness"],
    priceRange: "$$",
    currenciesAccepted: "MAD",
    paymentAccepted: "Cash, Credit Card",
    email: siteConfig.email,
    telephone: siteConfig.phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: siteConfig.city,
      addressRegion: siteConfig.region,
      addressCountry: "MA",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: siteConfig.geo.lat,
      longitude: siteConfig.geo.lng,
    },
    areaServed: siteConfig.areaServed.map((c) => ({ "@type": "City", name: c })),
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "08:00",
        closes: "20:00",
      },
    ],
    sameAs: siteConfig.social,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Plans repas",
      itemListElement: siteConfig.plans.map((p) => ({
        "@type": "Offer",
        name: p.name,
        category: "Meal plan subscription",
        priceCurrency: "MAD",
        url: `${siteConfig.url}/order?plan=${p.slug}`,
      })),
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export function WebSiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    url: siteConfig.url,
    name: siteConfig.name,
    inLanguage: ["fr-MA", "en"],
    publisher: { "@id": `${siteConfig.url}/#business` },
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}