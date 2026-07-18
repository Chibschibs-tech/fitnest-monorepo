import type { MetadataRoute } from "next"
import { sql } from "@/lib/db"

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.fitnest.ma"

// Public, indexable routes. Each is emitted with fr/en alternates so Google
// can serve the right language per user.
const STATIC_ROUTES: Array<{ path: string; priority: number; freq: "daily" | "weekly" | "monthly" }> = [
  { path: "/", priority: 1.0, freq: "daily" },
  { path: "/plans", priority: 0.9, freq: "weekly" },
  { path: "/compose-ton-plan", priority: 0.9, freq: "weekly" },
  { path: "/order", priority: 0.9, freq: "weekly" },
  { path: "/menu", priority: 0.9, freq: "daily" },
  { path: "/meal-plans", priority: 0.8, freq: "weekly" },
  { path: "/entreprises", priority: 0.8, freq: "monthly" },
  { path: "/how-it-works", priority: 0.7, freq: "monthly" },
  { path: "/faq", priority: 0.6, freq: "monthly" },
  { path: "/contact", priority: 0.6, freq: "monthly" },
  { path: "/about", priority: 0.5, freq: "monthly" },
  { path: "/express-shop", priority: 0.6, freq: "weekly" },
  { path: "/terms", priority: 0.2, freq: "monthly" },
  { path: "/privacy", priority: 0.2, freq: "monthly" },
  { path: "/legal", priority: 0.2, freq: "monthly" },
]

const alternates = (path: string) => ({
  languages: {
    fr: `${siteUrl}${path}`,
    en: `${siteUrl}${path}?lang=en`,
    "x-default": `${siteUrl}${path}`,
  },
})

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${siteUrl}${r.path}`,
    lastModified: now,
    changeFrequency: r.freq,
    priority: r.priority,
    alternates: alternates(r.path),
  }))

  // Meal plan detail pages, straight from the DB so new plans are indexed automatically.
  try {
    const plans = await sql`SELECT slug FROM meal_plans WHERE published = true`
    for (const p of plans as Array<{ slug: string }>) {
      entries.push({
        url: `${siteUrl}/meal-plans/${p.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: alternates(`/meal-plans/${p.slug}`),
      })
    }
  } catch {
    // A DB hiccup must never break the sitemap.
  }

  return entries
}