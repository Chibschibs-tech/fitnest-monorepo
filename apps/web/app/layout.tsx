import type React from "react"
import type { Metadata } from "next"
import { ClientLayout } from "./client-layout"
import "./globals.css"

export const dynamic = "force-dynamic"
export const revalidate = 0

const siteUrl = "https://fitnest.ma"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Fitnest.ma — Plans Repas Sains Livrés à Domicile au Maroc",
    template: "%s | Fitnest.ma",
  },
  description:
    "Fitnest.ma livre des repas sains préparés par des chefs et des plans repas personnalisés partout au Maroc. Choisissez votre objectif, personnalisez vos repas et profitez de livraisons fraîches.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Fitnest.ma — Plans Repas Sains Livrés à Domicile au Maroc",
    description:
      "Repas sains préparés par des chefs, livrés chez vous. Programmes Weight Loss, Stay Fit, Muscle Gain et Keto adaptés à vos objectifs.",
    siteName: "Fitnest.ma",
    locale: "fr_MA",
    images: [
      {
        url: "/images/og/fitnest-home.jpg",
        width: 1200,
        height: 630,
        alt: "Fitnest.ma — livraison de repas sains au Maroc",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fitnest.ma — Plans Repas Sains Livrés à Domicile",
    description:
      "Repas sains préparés par des chefs, livrés chez vous. Programmes adaptés à vos objectifs fitness.",
  },
  alternates: {
    canonical: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
