import type { Metadata } from "next"
import Link from "next/link"
import { getPlanEntryPrices, ENTRY_DAYS, ENTRY_MEALS } from "@/lib/plan-pricing"
import { sql } from "@/lib/db"
import { headers } from "next/headers"
import { plansCopy } from "@/lib/compose-i18n"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Nos formules & menu | Fitnest.ma",
  description:
    "Comparez les formules FitNest — Weight Loss, Stay Fit, Muscle Gain — avec des prix transparents et les valeurs nutritionnelles réelles de notre menu. Livraison à Casablanca.",
}

// `key` must match meal_type_prices.plan_name; `slug` is what /order expects.
const PLANS = [
  { key: "Weight Loss", slug: "weight-loss", title: "Weight Loss" },
  { key: "Stay Fit", slug: "stay-fit", title: "Stay Fit" },
  { key: "Muscle Gain", slug: "muscle-gain", title: "Muscle Gain" },
] as const

type DayRow = { meal_type: string; kcal: number; protein: number; carbs: number; fat: number }
type Featured = { title: string; image_url: string; meal_type: string; kcal: number; protein: number }

const num = (v: unknown) => Number(v ?? 0) || 0

export default async function PlansPage() {
  const locale = headers().get("x-locale") === "en" ? "en" : "fr"
  const T = plansCopy[locale]

  // Prices come from the same engine that prices the builder and checkout,
  // so a card can never show a number the customer will not actually pay.
  const prices = await getPlanEntryPrices(PLANS.map((p) => p.key))

  // Nutrition + imagery are REAL menu data, never invented: averaged macros per
  // meal type, and actual published dish photos.
  let dayRows: DayRow[] = []
  let featured: Featured[] = []
  try {
    dayRows = (await sql`
      SELECT meal_type,
             round(avg(kcal))::int    AS kcal,
             round(avg(protein))::int AS protein,
             round(avg(carbs))::int   AS carbs,
             round(avg(fat))::int      AS fat
      FROM meals
      WHERE published AND kcal > 0
      GROUP BY meal_type
    `) as DayRow[]
    featured = (await sql`
      SELECT title, image_url, meal_type, kcal, round(protein)::int AS protein
      FROM meals
      WHERE published AND image_url IS NOT NULL AND image_url <> ''
      ORDER BY meal_type, kcal
      LIMIT 6
    `) as Featured[]
  } catch {
    // If the menu query fails, the page still renders plans + prices.
  }

  const order = ["breakfast", "lunch", "dinner"]
  const byType = (t: string) => dayRows.find((r) => r.meal_type?.toLowerCase() === t)
  const dayMeals = order.map(byType).filter(Boolean) as DayRow[]
  const dayTotal = dayMeals.reduce(
    (a, r) => ({
      kcal: a.kcal + num(r.kcal),
      protein: a.protein + num(r.protein),
      carbs: a.carbs + num(r.carbs),
      fat: a.fat + num(r.fat),
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  )
  const rowLabel: Record<string, string> = {
    breakfast: T.rowBreakfast,
    lunch: T.rowLunch,
    dinner: T.rowDinner,
  }

  return (
    <main className="container px-4 py-8 md:py-12 space-y-12 md:space-y-16">
      {/* Hero */}
      <header className="text-center space-y-3 max-w-2xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-wide text-fitnest-orange">
          {T.heroKicker}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold">{T.title}</h1>
        <p className="text-gray-600">{T.intro}</p>
      </header>

      {/* Trust strip */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {T.trust.map((item) => (
          <div key={item.t} className="rounded-xl border bg-white p-4 text-center sm:text-left">
            <p className="font-semibold text-sm">{item.t}</p>
            <p className="text-xs text-gray-500 mt-1">{item.d}</p>
          </div>
        ))}
      </section>

      {/* Plan cards */}
      <section className="grid gap-6 md:grid-cols-3">
        {PLANS.map((p, i) => {
          const price = prices[p.key]
          const g = T.goals[p.slug]
          const img = featured[i] ?? featured[0]
          return (
            <article
              key={p.key}
              className="rounded-2xl border bg-white overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow"
            >
              {img && (
                <div className="relative h-40 bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.image_url}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-fitnest-green">
                    {g?.emphasis}
                  </span>
                </div>
              )}

              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-lg font-semibold">{p.title}</h3>

                {price ? (
                  <div className="mt-3">
                    <p className="text-2xl font-bold text-fitnest-green">
                      {price.weekly.toFixed(0)}{" "}
                      <span className="text-sm font-normal text-gray-600">{T.perWeek}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {T.from} · {ENTRY_MEALS.length} {T.baselineSuffix}
                    </p>
                    <p className="text-xs text-gray-500">
                      {price.pricePerDay.toFixed(0)} {T.perDay}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 mt-3">{T.noPrice}</p>
                )}

                <ul className="mt-4 space-y-2 text-sm text-gray-700 flex-1">
                  {g?.bullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <span className="text-fitnest-green" aria-hidden>
                        ✓
                      </span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-col gap-2">
                  <a
                    href={`/order?plan=${p.slug}`}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-fitnest-green px-5 py-3 text-sm font-medium text-white hover:bg-fitnest-green/90"
                  >
                    {T.configure}
                  </a>
                </div>
              </div>
            </article>
          )
        })}
      </section>

      {/* Typical-day nutrition — real menu averages */}
      {dayMeals.length > 0 && (
        <section className="rounded-2xl border bg-white p-6 md:p-8">
          <div className="flex items-baseline justify-between gap-4 mb-5">
            <h2 className="text-xl md:text-2xl font-bold">{T.typicalTitle}</h2>
            <Link href="/menu" className="text-sm text-fitnest-green hover:underline whitespace-nowrap">
              {T.menuBandCta} →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {dayMeals.map((r) => (
              <div key={r.meal_type} className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-semibold text-gray-500">{rowLabel[r.meal_type?.toLowerCase()] ?? r.meal_type}</p>
                <p className="text-xl font-bold mt-1">
                  {num(r.kcal)} <span className="text-xs font-normal text-gray-500">{T.kcalLabel}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {T.protLabel} {num(r.protein)}g · {T.carbLabel} {num(r.carbs)}g · {T.fatLabel} {num(r.fat)}g
                </p>
              </div>
            ))}
            <div className="rounded-xl bg-fitnest-green/10 border border-fitnest-green/30 p-4">
              <p className="text-xs font-semibold text-fitnest-green">{T.fullDay}</p>
              <p className="text-xl font-bold mt-1 text-fitnest-green">
                {dayTotal.kcal} <span className="text-xs font-normal">{T.kcalLabel}</span>
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {T.protLabel} {dayTotal.protein}g · {T.carbLabel} {dayTotal.carbs}g · {T.fatLabel} {dayTotal.fat}g
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4">{T.typicalNote}</p>
        </section>
      )}

      {/* Menu imagery band */}
      {featured.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-xl md:text-2xl font-bold">{T.menuBandTitle}</h2>
            <Link href="/menu" className="text-sm text-fitnest-green hover:underline whitespace-nowrap">
              {T.menuBandCta} →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {featured.map((m) => (
              <Link
                key={m.title + m.image_url}
                href="/menu"
                className="group relative rounded-xl overflow-hidden bg-gray-100 aspect-[3/2]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.image_url}
                  alt={m.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <p className="text-white text-sm font-medium leading-tight">{m.title}</p>
                  <p className="text-white/80 text-xs mt-0.5">
                    {num(m.kcal)} {T.kcalLabel} · {num(m.protein)}g {T.protLabel}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Compose CTA */}
      <section className="rounded-2xl border-2 border-fitnest-green bg-fitnest-green/5 p-6 md:p-8 text-center">
        <h2 className="text-2xl font-bold mb-2">{T.composeTitle}</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-5">{T.composeIntro}</p>
        <a
          href="/compose-ton-plan"
          className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-fitnest-orange px-6 py-3 text-sm font-medium text-white hover:bg-fitnest-orange/90"
        >
          {T.composeCta}
        </a>
      </section>
    </main>
  )
}
