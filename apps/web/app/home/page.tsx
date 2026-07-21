"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronRight, Check, UtensilsCrossed, ChefHat, Truck, Heart, CheckCircle2, TrendingUp } from "lucide-react"
import { useLanguage, localePath } from "@/components/language-provider"
import { getTranslations, defaultLocale } from "@/lib/i18n"
import { useState, useEffect, useRef } from "react"

interface Product {
  id: number
  name: string
  description: string
  price: number
  salePrice?: number
  imageUrl?: string
  category: string
}

export default function Home() {
  const { locale } = useLanguage()
  const [mounted, setMounted] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [planPrices, setPlanPrices] = useState<Record<string, { weekly: number; pricePerDay: number }>>({})

  useEffect(() => {
    setMounted(true)
  }, [])

  // Real engine prices for the plan cards — same source as /plans and checkout,
  // so the homepage can never show a stale number.
  useEffect(() => {
    fetch("/api/plan-entry-prices")
      .then((r) => r.json())
      .then((d) => { if (d?.prices) setPlanPrices(d.prices) })
      .catch(() => {})
  }, [])

  // Fallbacks equal today's engine output, so even on fetch failure the card
  // matches /plans rather than reverting to old teaser numbers.
  const planPrice = (key: string, fallback: number) => {
    const w = planPrices[key]?.weekly
    const v = w ? Math.round(w) : fallback
    return locale === "fr" ? `${v} Dhs` : `${v} MAD`
  }

  // Keep the visitor's language on every in-page link too (not just the navbar).
  const L = (href: string) => localePath(href, locale)

  // Mobile plan carousel: track which card is centred so the dots reflect it.
  const plansRef = useRef<HTMLDivElement>(null)
  const [activeSlide, setActiveSlide] = useState(0)
  const onPlansScroll = () => {
    const el = plansRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    const i = max > 0 ? Math.round((el.scrollLeft / max) * 2) : 0
    setActiveSlide(Math.max(0, Math.min(2, i)))
  }

  // Locale comes from the URL (via the provider), which is available during SSR
  // too — so render the page in the URL's language immediately, no French flash
  // and no French content indexed on /en pages.
  const t = getTranslations(locale)

  // Fetch Express Shop products
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoadingProducts(true)
        const response = await fetch('/api/products?limit=4')
        if (response.ok) {
          const data = await response.json()
          setProducts(data.slice(0, 4)) // Show only first 4 products
        }
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoadingProducts(false)
      }
    }
    fetchProducts()
  }, [])
  return (
    <>
      {/* Hero Section — real text over a food photo (translatable, never clips) */}
      <section className="relative isolate flex min-h-[88vh] w-full items-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1600&q=80&auto=format&fit=crop"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center -z-10"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-fitnest-green/85 via-fitnest-green/60 to-fitnest-green/90" />
        <div className="container mx-auto px-5 py-28 sm:py-32">
          <div className="max-w-2xl text-white">
            <p className="mb-3 text-xs sm:text-sm font-semibold uppercase tracking-wide text-fitnest-orange">
              {locale === "fr" ? "Repas sains, livrés à Casablanca" : "Healthy meals, delivered in Casablanca"}
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.05]">
              {locale === "fr" ? (
                <>La vie peut être compliquée.<br />Vos <span className="text-fitnest-orange">repas</span>, non.</>
              ) : (
                <>Life can be messy.<br />Your <span className="text-fitnest-orange">meals</span> shouldn&apos;t.</>
              )}
            </h1>
            <p className="mt-5 max-w-lg text-base sm:text-lg text-white/90">
              {locale === "fr"
                ? "Des repas équilibrés, préparés chaque jour et livrés chez toi. Choisis un programme ou compose tes propres plats."
                : "Balanced meals, freshly prepared and delivered to your door. Pick a plan or build your own."}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link href={L("/meal-plans")} className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-fitnest-orange text-white hover:bg-fitnest-orange/90 rounded-full px-8 py-6 text-base">
                  {t.home.hero.viewMealPlans}
                </Button>
              </Link>
              <Link href={L("/how-it-works")} className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-white text-fitnest-green hover:bg-white/90 rounded-full px-8 py-6 text-base">
                  {t.home.hero.howItWorks}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Content wrapper - starts after hero */}
      <div className="relative z-10 bg-white">
      {/* How It Works Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <p className="text-sm font-semibold uppercase text-fitnest-orange mb-2">{t.home.howItWorks.label}</p>
            <h2 className="text-3xl font-bold text-fitnest-green mb-4">{t.home.howItWorks.title}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t.home.howItWorks.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-8 max-w-6xl mx-auto">
            {/* Step 1: Choose Plan — row on mobile, centred card on desktop */}
            <div className="bg-white rounded-xl shadow-md md:shadow-lg p-4 md:p-8 flex flex-row md:flex-col items-center gap-4 md:gap-0 text-left md:text-center">
              <div className="shrink-0 md:mb-6 flex h-12 w-12 md:h-20 md:w-20 items-center justify-center rounded-lg bg-fitnest-orange/10">
                <UtensilsCrossed className="h-6 w-6 md:h-10 md:w-10 text-fitnest-orange" />
              </div>
              <div>
                <h3 className="text-base md:text-xl font-bold text-fitnest-green mb-0.5 md:mb-4">{t.home.howItWorks.choosePlan.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{t.home.howItWorks.choosePlan.description}</p>
              </div>
            </div>

            {/* Step 2: We Cook */}
            <div className="bg-white rounded-xl shadow-md md:shadow-lg p-4 md:p-8 flex flex-row md:flex-col items-center gap-4 md:gap-0 text-left md:text-center">
              <div className="shrink-0 md:mb-6 flex h-12 w-12 md:h-20 md:w-20 items-center justify-center rounded-lg bg-fitnest-orange/10">
                <ChefHat className="h-6 w-6 md:h-10 md:w-10 text-fitnest-orange" />
              </div>
              <div>
                <h3 className="text-base md:text-xl font-bold text-fitnest-green mb-0.5 md:mb-4">{t.home.howItWorks.weCook.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{t.home.howItWorks.weCook.description}</p>
              </div>
            </div>

            {/* Step 3: We Deliver */}
            <div className="bg-white rounded-xl shadow-md md:shadow-lg p-4 md:p-8 flex flex-row md:flex-col items-center gap-4 md:gap-0 text-left md:text-center">
              <div className="shrink-0 md:mb-6 flex h-12 w-12 md:h-20 md:w-20 items-center justify-center rounded-lg bg-fitnest-orange/10">
                <Truck className="h-6 w-6 md:h-10 md:w-10 text-fitnest-orange" />
              </div>
              <div>
                <h3 className="text-base md:text-xl font-bold text-fitnest-green mb-0.5 md:mb-4">{t.home.howItWorks.weDeliver.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{t.home.howItWorks.weDeliver.description}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Meal Plans Section */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="mb-2 text-center text-3xl font-bold text-fitnest-green">{t.home.choosePlan.title}</h2>
          <p className="mb-8 md:mb-12 text-center text-gray-600 max-w-2xl mx-auto">
            {t.home.choosePlan.subtitle}
          </p>

          <p className="md:hidden text-center text-xs text-gray-500 mb-3">
            {locale === "fr" ? "Glissez pour comparer les 3 formules →" : "Swipe to compare all 3 plans →"}
          </p>
          <div
            ref={plansRef}
            onScroll={onPlansScroll}
            className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto overflow-x-auto md:overflow-visible snap-x snap-mandatory -mx-4 px-4 md:mx-auto md:px-0 pb-4 md:pb-0 scrollbar-hide"
          >
            {/* Weight Loss Plan */}
            <div className="bg-white rounded-lg shadow-lg p-5 md:p-8 flex flex-col relative min-w-[80%] shrink-0 snap-center md:min-w-0">
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-full overflow-hidden">
                  <Image src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=400&fit=crop" alt="Weight Loss Meal Plan" fill className="object-cover" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-fitnest-green text-center">{t.home.choosePlan.weightLoss.title}</h3>
              <p className="text-gray-600 mb-1 text-center text-sm font-medium">{t.home.choosePlan.weightLoss.subtitle}</p>
              <p className="hidden sm:block text-gray-600 mb-4 text-center text-xs">{t.home.choosePlan.weightLoss.description}</p>
              <div className="text-center mb-4">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-[10px] font-normal text-gray-500">{locale === "fr" ? "à partir de" : "from"}</span>
                  <span className="text-xl font-bold text-fitnest-green">{planPrice("Weight Loss", 509)}</span>
                  <span className="text-gray-600 text-xs">{t.home.choosePlan.week}</span>
                </div>
              </div>
              <Link href={L("/meal-plans/weight-loss")} className="mb-6">
                <Button className="w-full rounded-full bg-gray-100 text-fitnest-green hover:bg-gray-200 shadow-md hover:shadow-lg">
                  {t.home.choosePlan.weightLoss.select}
                </Button>
              </Link>
              <ul className="space-y-2 flex-1">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-fitnest-orange mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600 text-sm">{t.home.choosePlan.weightLoss.features.reducedCarbs}</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-fitnest-orange mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600 text-sm">{t.home.choosePlan.weightLoss.features.highProtein}</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-fitnest-orange mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600 text-sm">{t.home.choosePlan.weightLoss.features.lowGlycemic}</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-fitnest-orange mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600 text-sm">{t.home.choosePlan.weightLoss.features.weightControl}</span>
                </li>
              </ul>
            </div>

            {/* Stay Fit Plan - Popular */}
            <div className="bg-white rounded-lg shadow-lg p-5 md:p-8 flex flex-col relative border-2 border-fitnest-orange min-w-[80%] shrink-0 snap-center md:min-w-0">
              <div className="absolute top-4 right-4">
                <span className="bg-fitnest-orange text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {locale === "fr" ? "POPULAIRE" : "POPULAR"}
                </span>
              </div>
              <div className="flex justify-center mb-6">
                <div className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-full overflow-hidden">
                  <Image src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop" alt="Stay Fit Meal Plan" fill className="object-cover" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-fitnest-green text-center">{t.home.choosePlan.stayFit.title}</h3>
              <p className="text-gray-600 mb-1 text-center text-sm font-medium">{t.home.choosePlan.stayFit.subtitle}</p>
              <p className="hidden sm:block text-gray-600 mb-4 text-center text-xs">{t.home.choosePlan.stayFit.description}</p>
              <div className="text-center mb-4">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-[10px] font-normal text-gray-500">{locale === "fr" ? "à partir de" : "from"}</span>
                  <span className="text-xl font-bold text-fitnest-green">{planPrice("Stay Fit", 558)}</span>
                  <span className="text-gray-600 text-xs">{t.home.choosePlan.week}</span>
                </div>
              </div>
              <Link href={L("/meal-plans/balanced-nutrition")} className="mb-6">
                <Button className="w-full rounded-full bg-fitnest-orange text-white hover:bg-fitnest-orange/90 shadow-md hover:shadow-lg">
                  {t.home.choosePlan.stayFit.select}
                </Button>
              </Link>
              <ul className="space-y-2 flex-1">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-fitnest-orange mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600 text-sm">{t.home.choosePlan.stayFit.features.wellBalanced}</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-fitnest-orange mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600 text-sm">{t.home.choosePlan.stayFit.features.nutrientDense}</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-fitnest-orange mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600 text-sm">{t.home.choosePlan.stayFit.features.realLife}</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-fitnest-orange mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600 text-sm">{t.home.choosePlan.stayFit.features.sustainable}</span>
                </li>
              </ul>
            </div>

            {/* Muscle Gain Plan */}
            <div className="bg-white rounded-lg shadow-lg p-5 md:p-8 flex flex-col relative min-w-[80%] shrink-0 snap-center md:min-w-0">
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-full overflow-hidden">
                  <Image src="https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=400&fit=crop" alt="Muscle Gain Meal Plan" fill className="object-cover" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-fitnest-green text-center">{t.home.choosePlan.muscleGain.title}</h3>
              <p className="text-gray-600 mb-1 text-center text-sm font-medium">{t.home.choosePlan.muscleGain.subtitle}</p>
              <p className="hidden sm:block text-gray-600 mb-4 text-center text-xs">{t.home.choosePlan.muscleGain.description}</p>
              <div className="text-center mb-4">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-[10px] font-normal text-gray-500">{locale === "fr" ? "à partir de" : "from"}</span>
                  <span className="text-xl font-bold text-fitnest-green">{planPrice("Muscle Gain", 655)}</span>
                  <span className="text-gray-600 text-xs">{t.home.choosePlan.week}</span>
                </div>
              </div>
              <Link href={L("/meal-plans/muscle-gain")} className="mb-6">
                <Button className="w-full rounded-full bg-gray-100 text-fitnest-green hover:bg-gray-200 shadow-md hover:shadow-lg">
                  {t.home.choosePlan.muscleGain.select}
                </Button>
              </Link>
              <ul className="space-y-2 flex-1">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-fitnest-orange mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600 text-sm">{t.home.choosePlan.muscleGain.features.highProtein}</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-fitnest-orange mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600 text-sm">{t.home.choosePlan.muscleGain.features.trainingRecovery}</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-fitnest-orange mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600 text-sm">{t.home.choosePlan.muscleGain.features.cleanCarbs}</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-fitnest-orange mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600 text-sm">{t.home.choosePlan.muscleGain.features.performance}</span>
                </li>
              </ul>
            </div>
          </div>
          {/* Swipe dots (mobile) */}
          <div className="md:hidden flex justify-center gap-2 mt-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`h-2 rounded-full transition-all ${activeSlide === i ? "w-5 bg-fitnest-green" : "w-2 bg-gray-300"}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Compose ton plan Section */}
      <section className="py-12 md:py-16 bg-fitnest-green text-white">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-fitnest-orange">
            {locale === "fr" ? "Sur mesure" : "Made to measure"}
          </p>
          <h2 className="mb-3 text-3xl font-bold">
            {locale === "fr" ? "Compose ton plan" : "Build your own plan"}
          </h2>
          <p className="mx-auto mb-6 max-w-xl text-white/85">
            {locale === "fr"
              ? "Un objectif précis à atteindre ? Des macros à remplir chaque jour ? Compose chaque plat selon tes besoins — protéine, féculent, légumes — suis tes calories en direct et enregistre tes plats favoris."
              : "A specific goal to hit? Daily macros to fill? Build every meal to fit your needs — protein, carb, vegetables — track your calories live and save your favourite meals."}
          </p>
          <Link href={L("/compose-ton-plan")}>
            <Button className="rounded-full bg-fitnest-orange px-8 py-6 text-base text-white hover:bg-fitnest-orange/90">
              {locale === "fr" ? "Composer mon plan" : "Build my plan"}
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 md:mb-12 text-center text-3xl font-bold">{t.home.whyChooseFitnest.title}</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-8">
            <div className="rounded-xl p-4 md:p-6 shadow-md md:shadow-lg bg-gray-50 flex flex-row md:flex-col items-center gap-4 md:gap-0 text-left md:text-center">
              <div className="shrink-0 md:mx-auto md:mb-4 flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-lg bg-fitnest-green/10">
                <Heart className="h-6 w-6 md:h-10 md:w-10 text-fitnest-green" />
              </div>
              <div>
                <h3 className="mb-0.5 md:mb-2 text-base md:text-xl font-semibold">{t.home.whyChooseFitnest.healthFirst.title}</h3>
                <p className="text-gray-600 text-sm md:text-base">{t.home.whyChooseFitnest.healthFirst.description}</p>
              </div>
            </div>
            <div className="rounded-xl p-4 md:p-6 shadow-md md:shadow-lg bg-gray-50 flex flex-row md:flex-col items-center gap-4 md:gap-0 text-left md:text-center">
              <div className="shrink-0 md:mx-auto md:mb-4 flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-lg bg-fitnest-orange/10">
                <CheckCircle2 className="h-6 w-6 md:h-10 md:w-10 text-fitnest-orange" />
              </div>
              <div>
                <h3 className="mb-0.5 md:mb-2 text-base md:text-xl font-semibold">{t.home.whyChooseFitnest.simplicity.title}</h3>
                <p className="text-gray-600 text-sm md:text-base">{t.home.whyChooseFitnest.simplicity.description}</p>
              </div>
            </div>
            <div className="rounded-xl p-4 md:p-6 shadow-md md:shadow-lg bg-gray-50 flex flex-row md:flex-col items-center gap-4 md:gap-0 text-left md:text-center">
              <div className="shrink-0 md:mx-auto md:mb-4 flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-lg bg-fitnest-green/10">
                <TrendingUp className="h-6 w-6 md:h-10 md:w-10 text-fitnest-green" />
              </div>
              <div>
                <h3 className="mb-0.5 md:mb-2 text-base md:text-xl font-semibold">{t.home.whyChooseFitnest.transformation.title}</h3>
                <p className="text-gray-600 text-sm md:text-base">{t.home.whyChooseFitnest.transformation.description}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Corporate / Entreprises Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto rounded-2xl border bg-gray-50 p-6 md:p-10 md:flex md:items-center md:gap-8">
            <div className="md:flex-1">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-fitnest-orange">
                {locale === "fr" ? "FitNest Entreprises" : "FitNest for Business"}
              </p>
              <h2 className="mb-3 text-2xl md:text-3xl font-bold text-fitnest-green">
                {locale === "fr" ? "La santé de vos équipes, livrée." : "Your team's health, delivered."}
              </h2>
              <p className="mb-5 text-gray-600 md:mb-0">
                {locale === "fr"
                  ? "Buffets healthy pour vos événements et déjeuners quotidiens pour vos collaborateurs — livraison groupée, macros affichées, cuisine agréée ONSSA."
                  : "Healthy buffets for your events and daily lunches for your team — grouped delivery, macros shown, ONSSA-approved kitchen."}
              </p>
            </div>
            <div className="md:shrink-0">
              <Link href={L("/entreprises")}>
                <Button className="w-full md:w-auto rounded-full bg-fitnest-green px-8 py-6 text-base text-white hover:bg-fitnest-green/90">
                  {locale === "fr" ? "Découvrir l'offre entreprise" : "Explore business plans"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section - Improved mobile horizontal scrolling */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="mb-2 text-center text-3xl font-bold">{t.home.blog.title}</h2>
          <p className="mb-8 text-center text-gray-600 max-w-2xl mx-auto">
            {t.home.blog.subtitle}
          </p>

          {/* Mobile Horizontal Scrolling Blog Posts */}
          <div className="md:hidden">
            <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
              <div className="flex space-x-4 pb-6">
                {/* Blog Post 1 */}
                <div className="flex-shrink-0 w-[280px] bg-white rounded-lg overflow-hidden shadow-md">
                  <div className="relative h-40">
                    <Image
                      src="https://images.unsplash.com/photo-1547592180-85f173990554?w=280&h=160&fit=crop"
                      alt="Meal Prep Tips"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold px-2 py-1 bg-fitnest-green/10 text-fitnest-green rounded-full">
                        {t.home.blog.mealPrep}
                      </span>
                      <span className="text-xs text-gray-500">5 {t.home.blog.min}</span>
                    </div>
                    <h3 className="text-lg font-bold mb-2 line-clamp-2">
                      {t.home.blog.post1.title}
                    </h3>
                    <Link
                      href={L("/blog/healthy-meal-prep")}
                      className="text-fitnest-orange font-medium text-sm flex items-center"
                    >
                      {t.home.blog.readMore} <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </div>

                {/* Blog Post 2 */}
                <div className="flex-shrink-0 w-[280px] bg-white rounded-lg overflow-hidden shadow-md">
                  <div className="relative h-40">
                    <Image
                      src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=280&h=160&fit=crop"
                      alt="Nutrition Myths"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold px-2 py-1 bg-fitnest-orange/10 text-fitnest-orange rounded-full">
                        {t.home.blog.nutrition}
                      </span>
                      <span className="text-xs text-gray-500">7 {t.home.blog.min}</span>
                    </div>
                    <h3 className="text-lg font-bold mb-2 line-clamp-2">{t.home.blog.post2.title}</h3>
                    <Link
                      href={L("/blog/nutrition-myths")}
                      className="text-fitnest-orange font-medium text-sm flex items-center"
                    >
                      {t.home.blog.readMore} <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </div>

                {/* Blog Post 3 */}
                <div className="flex-shrink-0 w-[280px] bg-white rounded-lg overflow-hidden shadow-md">
                  <div className="relative h-40">
                    <Image
                      src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=280&h=160&fit=crop"
                      alt="Weight Loss Plateau"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold px-2 py-1 bg-fitnest-green/10 text-fitnest-green rounded-full">
                        {t.home.blog.fitness}
                      </span>
                      <span className="text-xs text-gray-500">8 {t.home.blog.min}</span>
                    </div>
                    <h3 className="text-lg font-bold mb-2 line-clamp-2">{t.home.blog.post3.title}</h3>
                    <Link
                      href={L("/blog/weight-loss-plateau")}
                      className="text-fitnest-orange font-medium text-sm flex items-center"
                    >
                      {t.home.blog.readMore} <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Blog Grid */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Blog Post 1 */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md transition-transform hover:shadow-lg">
              <div className="relative h-48">
                <Image src="https://images.unsplash.com/photo-1547592180-85f173990554?w=384&h=192&fit=crop" alt="Meal Prep Tips" fill className="object-cover" />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold px-2 py-1 bg-fitnest-green/10 text-fitnest-green rounded-full">
                    {t.home.blog.mealPrep}
                  </span>
                  <span className="text-xs text-gray-500">5 {t.home.blog.minRead}</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{t.home.blog.post1.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {t.home.blog.post1.description}
                </p>
                <Link href={L("/blog/healthy-meal-prep")}>
                  <Button
                    variant="outline"
                    className="w-full border-fitnest-orange text-fitnest-orange hover:bg-fitnest-orange hover:text-white"
                  >
                    {t.home.blog.readMore}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Blog Post 2 */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md transition-transform hover:shadow-lg">
              <div className="relative h-48">
                <Image
                  src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=384&h=192&fit=crop"
                  alt="Nutrition Myths"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold px-2 py-1 bg-fitnest-orange/10 text-fitnest-orange rounded-full">
                    {t.home.blog.nutrition}
                  </span>
                  <span className="text-xs text-gray-500">7 {t.home.blog.minRead}</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{t.home.blog.post2.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {t.home.blog.post2.description}
                </p>
                <Link href={L("/blog/nutrition-myths")}>
                  <Button
                    variant="outline"
                    className="w-full border-fitnest-orange text-fitnest-orange hover:bg-fitnest-orange hover:text-white"
                  >
                    {t.home.blog.readMore}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Blog Post 3 */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md transition-transform hover:shadow-lg">
              <div className="relative h-48">
                <Image
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=384&h=192&fit=crop"
                  alt="Weight Loss Plateau"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold px-2 py-1 bg-fitnest-green/10 text-fitnest-green rounded-full">
                    {t.home.blog.fitness}
                  </span>
                  <span className="text-xs text-gray-500">8 {t.home.blog.minRead}</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{t.home.blog.post3.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {t.home.blog.post3.description}
                </p>
                <Link href={L("/blog/weight-loss-plateau")}>
                  <Button
                    variant="outline"
                    className="w-full border-fitnest-orange text-fitnest-orange hover:bg-fitnest-orange hover:text-white"
                  >
                    {t.home.blog.readMore}
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link href={L("/blog")}>
              <Button className="bg-fitnest-orange text-white hover:bg-fitnest-orange/90">{t.home.blog.viewAllArticles}</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Express Shop Section */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="mb-2 text-center text-3xl font-bold">{t.home.expressShop.title}</h2>
          <p className="mb-8 md:mb-12 text-center text-gray-600 max-w-2xl mx-auto">
            {t.home.expressShop.subtitle}
          </p>

          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden shadow-lg animate-pulse">
                  <div className="relative h-48 bg-gray-200" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 pb-4 scrollbar-hide sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 sm:overflow-visible">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105 min-w-[72%] shrink-0 snap-center sm:min-w-0">
                  <div className="relative h-48">
                    {product.imageUrl ? (
                      <Image 
                        src={product.imageUrl} 
                        alt={product.name} 
                        fill 
                        className="object-cover" 
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">{locale === "fr" ? "Pas d'image" : "No image"}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <span className="text-fitnest-green font-bold text-sm sm:text-base">
                        {product.salePrice ? (
                          <>
                            {product.salePrice} MAD
                            <span className="text-gray-500 text-xs line-through ml-2">{product.price} MAD</span>
                          </>
                        ) : (
                          <>
                            {locale === "fr" && <span>{t.home.expressShop.from} </span>}
                            {product.price} MAD
                          </>
                        )}
                      </span>
                      <Link href={L(`/express-shop/${product.id}`)} className="w-full sm:w-auto">
                        <Button size="sm" className="bg-fitnest-green hover:bg-fitnest-green/90 text-white w-full sm:w-auto">
                          {t.home.expressShop.shopNow}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">{locale === "fr" ? "Aucun produit disponible" : "No products available"}</p>
            </div>
          )}

          <div className="mt-10 text-center">
            <Link href={L("/express-shop")}>
              <Button className="bg-fitnest-orange text-white hover:bg-fitnest-orange/90">{t.home.expressShop.visitExpressShop}</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-fitnest-green py-14 md:py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 text-3xl font-bold">{t.home.cta.title}</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg">
            {t.home.cta.description}
          </p>
          <Link href={L("/order")}>
            <Button className="bg-fitnest-orange text-white hover:bg-fitnest-orange/90">{t.home.cta.button}</Button>
          </Link>
        </div>
      </section>
      </div>
    </>
  )
}
