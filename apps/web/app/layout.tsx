import type React from "react"
import type { Metadata } from "next"
import { ClientLayout } from "./client-layout"
import { siteConfig, buildAlternates } from "@/lib/site-config"
import { LocalBusinessJsonLd, WebSiteJsonLd } from "@/components/seo-jsonld"
import "./globals.css"

export const dynamic = "force-dynamic"
export const revalidate = 0

const siteUrl = siteConfig.url

// French is the primary language, English is served on the same URLs via the
// language switcher, so every page declares fr/en alternates.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "FitNest | Livraison de repas sains à Casablanca",
    template: "%s | FitNest",
  },
  description: siteConfig.descriptionFr,
  keywords: [
    "livraison repas sains Casablanca",
    "meal prep Maroc",
    "plan repas perte de poids",
    "prise de masse Casablanca",
    "repas fitness livrés",
    "healthy meal delivery Morocco",
  ],
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  formatDetection: { telephone: true, address: true },
  icons: { icon: "/favicon.ico" },
  openGraph: {
    type: "website",
    url: siteUrl,
    locale: "fr_MA",
    alternateLocale: ["en_US"],
    title: "FitNest | Livraison de repas sains à Casablanca",
    description: siteConfig.descriptionFr,
    siteName: siteConfig.name,
    images: [
      {
        url: "/images/og/fitnest-home.jpg",
        width: 1200,
        height: 630,
        alt: "FitNest - livraison de repas sains au Maroc",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FitNest | Livraison de repas sains à Casablanca",
    description: siteConfig.descriptionFr,
  },
  alternates: buildAlternates("/"),
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  other: {
    "geo.region": "MA-CAS",
    "geo.placename": siteConfig.city,
    "geo.position": `${siteConfig.geo.lat};${siteConfig.geo.lng}`,
    ICBM: `${siteConfig.geo.lat}, ${siteConfig.geo.lng}`,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <LocalBusinessJsonLd />
        <WebSiteJsonLd />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}