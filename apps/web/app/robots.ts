import type { MetadataRoute } from "next"
import { siteConfig } from "@/lib/site-config"

const siteUrl = siteConfig.url

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Never index private or transactional surfaces.
        disallow: ["/admin", "/api", "/dashboard", "/checkout", "/cart", "/shopping-cart", "/logout", "/login", "/register"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}