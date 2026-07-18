import { headers } from "next/headers"
import { siteConfig, enPath } from "@/lib/site-config"

/**
 * Per-page canonical + hreflang.
 *
 * The root layout cannot hardcode these: a static canonical would tell Google
 * that every page is a duplicate of the homepage. Middleware puts the real
 * route (locale prefix stripped) on x-pathname, so each page emits its own
 * canonical and its fr/en pair.
 */
export function SeoCanonical() {
  const h = headers()
  const locale = h.get("x-locale") === "en" ? "en" : "fr"
  const rawPath = h.get("x-pathname") || "/"

  // Never index query strings or trailing slashes as separate URLs.
  const path = rawPath.split("?")[0].replace(/\/+$/, "") || "/"

  const fr = `${siteConfig.url}${path === "/" ? "" : path}`
  const en = `${siteConfig.url}${enPath(path)}`
  const canonical = locale === "en" ? en : fr

  return (
    <>
      <link rel="canonical" href={canonical} />
      <link rel="alternate" hrefLang="fr-MA" href={fr} />
      <link rel="alternate" hrefLang="fr" href={fr} />
      <link rel="alternate" hrefLang="en" href={en} />
      <link rel="alternate" hrefLang="x-default" href={fr} />
    </>
  )
}