import type React from "react"
import type { Metadata } from "next"
import { ClientLayout } from "./client-layout"
import "./globals.css"

export const dynamic = "force-dynamic"
export const revalidate = 0

const siteUrl = "https://fitnest.ma"

// Global metadata for SEO and social sharing
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Fitnest.ma | Healthy Meal Delivery in Morocco",
    template: "%s | Fitnest.ma",
  },
  description:
    "Fitnest.ma delivers healthy, chef-prepared meals and tailored meal plans across Morocco. Choose your goal, customize your meals, and enjoy fresh deliveries.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Fitnest.ma | Healthy Meal Delivery in Morocco",
    description:
      "Healthy, chef-prepared meals and meal plans delivered to your door. Weight loss, stay fit, and muscle gain programs tailored to your goals.",
    siteName: "Fitnest.ma",
    images: [
      {
        url: "/images/og/fitnest-home.jpg",
        width: 1200,
        height: 630,
        alt: "Fitnest.ma healthy meal delivery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fitnest.ma | Healthy Meal Delivery in Morocco",
    description:
      "Healthy, chef-prepared meals and meal plans delivered to your door. Weight loss, stay fit, and muscle gain programs tailored to your goals.",
  },
  alternates: {
    canonical: siteUrl,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
