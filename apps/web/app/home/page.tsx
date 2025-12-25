"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronRight, Check, UtensilsCrossed, ChefHat, Truck, Heart, CheckCircle2, TrendingUp } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { getTranslations, defaultLocale } from "@/lib/i18n"
import { useState, useEffect } from "react"

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
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const t = getTranslations(mounted ? locale : defaultLocale)

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
      {/* Hero Section - Full screen with navbar overlay */}
      <section 
        className="relative flex items-end bg-gray-100 h-screen w-full"
        style={{
          zIndex: 0
        }}
      >
        <div className="absolute inset-0 w-full h-full">
          <img
            src="https://kjfqnhte2vxtsffe.public.blob.vercel-storage.com/Images/Hero%20image%20Fitnest%20life%20can%20be%20messy"
            alt="Fitnest.ma Hero Banner"
            className="w-full h-full object-cover object-center"
            style={{ zIndex: 0 }}
            onError={(e) => {
              // Fallback if image doesn't load
              console.error("Hero image failed to load:", e)
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
            }}
          />
        </div>
        <div className="relative z-10 container mx-auto px-4 pb-8 sm:pb-12 md:pb-16">
          <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-0 sm:flex-row sm:space-x-4">
            <Link href="/meal-plans">
              <Button className="bg-fitnest-orange text-white hover:bg-fitnest-orange/90 w-full sm:w-auto text-sm sm:text-base px-6 py-2 sm:px-8 sm:py-3">
                {t.home.hero.viewMealPlans}
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button className="bg-white text-fitnest-green hover:bg-white/90 w-full sm:w-auto text-sm sm:text-base px-6 py-2 sm:px-8 sm:py-3">
                {t.home.hero.howItWorks}
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Content wrapper - starts after hero */}
      <div className="relative z-10 bg-white">
      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase text-fitnest-orange mb-2">{t.home.howItWorks.label}</p>
            <h2 className="text-3xl font-bold text-fitnest-green mb-4">{t.home.howItWorks.title}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t.home.howItWorks.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Step 1: Choose Plan */}
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-lg bg-fitnest-orange/10 flex items-center justify-center">
                  <UtensilsCrossed className="h-10 w-10 text-fitnest-orange" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-fitnest-green mb-4">{t.home.howItWorks.choosePlan.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {t.home.howItWorks.choosePlan.description}
              </p>
            </div>

            {/* Step 2: We Cook */}
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-lg bg-fitnest-orange/10 flex items-center justify-center">
                  <ChefHat className="h-10 w-10 text-fitnest-orange" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-fitnest-green mb-4">{t.home.howItWorks.weCook.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {t.home.howItWorks.weCook.description}
              </p>
            </div>

            {/* Step 3: We Deliver */}
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-lg bg-fitnest-orange/10 flex items-center justify-center">
                  <Truck className="h-10 w-10 text-fitnest-orange" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-fitnest-green mb-4">{t.home.howItWorks.weDeliver.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {t.home.howItWorks.weDeliver.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Meal Plans Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="mb-2 text-center text-3xl font-bold text-fitnest-green">{t.home.choosePlan.title}</h2>
          <p className="mb-12 text-center text-gray-600 max-w-2xl mx-auto">
            {t.home.choosePlan.subtitle}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Weight Loss Plan */}
            <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col relative">
              <div className="flex justify-center mb-6">
                <div className="relative w-32 h-32 rounded-full overflow-hidden">
                  <Image src="/weight-loss-meal.png" alt="Weight Loss Meal Plan" fill className="object-cover" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-fitnest-green text-center">{t.home.choosePlan.weightLoss.title}</h3>
              <p className="text-gray-600 mb-1 text-center text-sm font-medium">{t.home.choosePlan.weightLoss.subtitle}</p>
              <p className="text-gray-600 mb-6 text-center text-xs">{t.home.choosePlan.weightLoss.description}</p>
              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-[10px] font-normal text-gray-500">{locale === "fr" ? "à partir de" : "from"}</span>
                  <span className="text-xl font-bold text-fitnest-green">{locale === "fr" ? "420 Dhs" : "420 MAD"}</span>
                  <span className="text-gray-600 text-xs">{t.home.choosePlan.week}</span>
                </div>
              </div>
              <Link href="/meal-plans/weight-loss" className="mb-6">
                <Button className="w-full rounded-full bg-gray-100 text-fitnest-green hover:bg-gray-200 shadow-md hover:shadow-lg">
                  {t.home.choosePlan.weightLoss.select}
                </Button>
              </Link>
              <ul className="space-y-3 flex-1">
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
            <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col relative border-2 border-fitnest-orange">
              <div className="absolute top-4 right-4">
                <span className="bg-fitnest-orange text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {locale === "fr" ? "POPULAIRE" : "POPULAR"}
                </span>
              </div>
              <div className="flex justify-center mb-6">
                <div className="relative w-32 h-32 rounded-full overflow-hidden">
                  <Image src="/vibrant-nutrition-plate.png" alt="Stay Fit Meal Plan" fill className="object-cover" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-fitnest-green text-center">{t.home.choosePlan.stayFit.title}</h3>
              <p className="text-gray-600 mb-1 text-center text-sm font-medium">{t.home.choosePlan.stayFit.subtitle}</p>
              <p className="text-gray-600 mb-6 text-center text-xs">{t.home.choosePlan.stayFit.description}</p>
              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-[10px] font-normal text-gray-500">{locale === "fr" ? "à partir de" : "from"}</span>
                  <span className="text-xl font-bold text-fitnest-green">{locale === "fr" ? "450 dhs" : "450 MAD"}</span>
                  <span className="text-gray-600 text-xs">{t.home.choosePlan.week}</span>
                </div>
              </div>
              <Link href="/meal-plans/balanced-nutrition" className="mb-6">
                <Button className="w-full rounded-full bg-fitnest-orange text-white hover:bg-fitnest-orange/90 shadow-md hover:shadow-lg">
                  {t.home.choosePlan.stayFit.select}
                </Button>
              </Link>
              <ul className="space-y-3 flex-1">
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
            <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col relative">
              <div className="flex justify-center mb-6">
                <div className="relative w-32 h-32 rounded-full overflow-hidden">
                  <Image src="/muscle-gain-meal.png" alt="Muscle Gain Meal Plan" fill className="object-cover" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-fitnest-green text-center">{t.home.choosePlan.muscleGain.title}</h3>
              <p className="text-gray-600 mb-1 text-center text-sm font-medium">{t.home.choosePlan.muscleGain.subtitle}</p>
              <p className="text-gray-600 mb-6 text-center text-xs">{t.home.choosePlan.muscleGain.description}</p>
              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-[10px] font-normal text-gray-500">{locale === "fr" ? "à partir de" : "from"}</span>
                  <span className="text-xl font-bold text-fitnest-green">{locale === "fr" ? "500 dhs" : "500 MAD"}</span>
                  <span className="text-gray-600 text-xs">{t.home.choosePlan.week}</span>
                </div>
              </div>
              <Link href="/meal-plans/muscle-gain" className="mb-6">
                <Button className="w-full rounded-full bg-gray-100 text-fitnest-green hover:bg-gray-200 shadow-md hover:shadow-lg">
                  {t.home.choosePlan.muscleGain.select}
                </Button>
              </Link>
              <ul className="space-y-3 flex-1">
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
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">{t.home.whyChooseFitnest.title}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:grid-cols-3">
            <div className="rounded-lg p-6 text-center shadow-lg bg-gray-50">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-fitnest-green/10 text-fitnest-green">
                <Heart className="h-10 w-10 text-fitnest-green" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">{t.home.whyChooseFitnest.healthFirst.title}</h3>
              <p className="text-gray-600">
                {t.home.whyChooseFitnest.healthFirst.description}
              </p>
            </div>
            <div className="rounded-lg p-6 text-center shadow-lg bg-gray-50">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-fitnest-orange/10 text-fitnest-orange">
                <CheckCircle2 className="h-10 w-10 text-fitnest-orange" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">{t.home.whyChooseFitnest.simplicity.title}</h3>
              <p className="text-gray-600">
                {t.home.whyChooseFitnest.simplicity.description}
              </p>
            </div>
            <div className="rounded-lg p-6 text-center shadow-lg bg-gray-50">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-fitnest-green/10 text-fitnest-green">
                <TrendingUp className="h-10 w-10 text-fitnest-green" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">{t.home.whyChooseFitnest.transformation.title}</h3>
              <p className="text-gray-600">
                {t.home.whyChooseFitnest.transformation.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section - Improved mobile horizontal scrolling */}
      <section className="py-20 bg-white">
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
                      src="/placeholder.svg?height=160&width=280"
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
                      href="/blog/healthy-meal-prep"
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
                      src="/placeholder.svg?height=160&width=280"
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
                      href="/blog/nutrition-myths"
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
                      src="/placeholder.svg?height=160&width=280"
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
                      href="/blog/weight-loss-plateau"
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
                <Image src="/placeholder.svg?height=192&width=384" alt="Meal Prep Tips" fill className="object-cover" />
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
                <Link href="/blog/healthy-meal-prep">
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
                  src="/placeholder.svg?height=192&width=384"
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
                <Link href="/blog/nutrition-myths">
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
                  src="/placeholder.svg?height=192&width=384"
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
                <Link href="/blog/weight-loss-plateau">
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
            <Link href="/blog">
              <Button className="bg-fitnest-orange text-white hover:bg-fitnest-orange/90">{t.home.blog.viewAllArticles}</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Express Shop Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="mb-2 text-center text-3xl font-bold">{t.home.expressShop.title}</h2>
          <p className="mb-12 text-center text-gray-600 max-w-2xl mx-auto">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105">
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
                      <Link href={`/express-shop/${product.id}`} className="w-full sm:w-auto">
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
            <Link href="/express-shop">
              <Button className="bg-fitnest-orange text-white hover:bg-fitnest-orange/90">{t.home.expressShop.visitExpressShop}</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-fitnest-green py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 text-3xl font-bold">{t.home.cta.title}</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg">
            {t.home.cta.description}
          </p>
          <Link href="/order">
            <Button className="bg-fitnest-orange text-white hover:bg-fitnest-orange/90">{t.home.cta.button}</Button>
          </Link>
        </div>
      </section>
      </div>
    </>
  )
}
