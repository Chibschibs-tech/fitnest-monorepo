"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { format, addDays, isBefore, isAfter, startOfWeek, startOfDay, getWeek, getYear } from "date-fns"
import { ChevronLeft, Info, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { DeliveryCalendar } from "@/components/delivery-calendar"
// Pricing is computed by the DB-driven engine via /api/calculate-price.
function formatPrice(amount: number, currency = "MAD"): string {
  return `${(amount ?? 0).toFixed(2)} ${currency}`
}

type Pricing = {
  pricePerDay: number
  totalDays: number
  weeks: number
  subtotal: number
  discountPct: number
  discountLabel: string
  discountAmount: number
  total: number
}

// Define meal plan data
const mealPlans = {
  "weight-loss": {
    title: "Weight Loss",
    description:
      "Repas a calories controlees (1200-1500 kcal/jour) pour perdre du poids sans jamais avoir faim.",
    basePrice: 350,
    image: "/vibrant-weight-loss-meal.png",
  },
  "stay-fit": {
    title: "Stay Fit",
    description:
      "Repas equilibres (1600-1900 kcal/jour) avec le juste equilibre proteines, glucides et bons lipides.",
    basePrice: 320,
    image: "/vibrant-nutrition-plate.png",
  },
  "muscle-gain": {
    title: "Muscle Gain",
    description:
      "Repas riches en proteines (2200-2500 kcal/jour) pour la prise de masse et la recuperation.",
    basePrice: 400,
    image: "/hearty-muscle-meal.png",
  },
  keto: {
    title: "Keto",
    description:
      "Repas pauvres en glucides et riches en bons lipides (1700-1900 kcal/jour) pour atteindre et maintenir la cetose.",
    basePrice: 380,
    image: "/colorful-keto-plate.png",
  },
}

const mealTypes = [
  { id: "breakfast", label: "Petit-dejeuner", description: "Bien commencer la journee" },
  { id: "lunch", label: "Dejeuner", description: "L energie du midi" },
  { id: "dinner", label: "Diner", description: "Un soir leger et complet" },
]

const snackOptions = [
  { id: "0-snacks", label: "Sans collation", description: "Aucune collation", value: 0 },
  { id: "1-snack", label: "1 collation / jour", description: "Une collation saine par jour", value: 1 },
  { id: "2-snacks", label: "2 collations / jour", description: "Deux collations saines par jour", value: 2 },
]

const allergies = [
  { id: "dairy", label: "Dairy", description: "Milk, cheese, yogurt" },
  { id: "gluten", label: "Gluten", description: "Wheat, barley, rye" },
  { id: "nuts", label: "Nuts", description: "Peanuts, tree nuts" },
  { id: "shellfish", label: "Shellfish", description: "Shrimp, crab, lobster" },
  { id: "eggs", label: "Eggs", description: "Chicken eggs" },
  { id: "soy", label: "Soy", description: "Soybeans and products" },
]

const durationOptions = [
  { value: 1, label: "1 semaine", weeks: 1 },
  { value: 2, label: "2 semaines", weeks: 2 },
  { value: 4, label: "1 mois", weeks: 4 },
]

// Sample meals for menu building
const sampleMeals = {
  breakfast: [
    { id: "b1", name: "Fluffy Protein Stack", image: "/fluffy-protein-stack.png", calories: 320 },
    { id: "b2", name: "Layered Berry Parfait", image: "/layered-berry-parfait.png", calories: 280 },
    { id: "b3", name: "Fluffy Egg White Omelette", image: "/fluffy-egg-white-omelette.png", calories: 250 },
    { id: "b4", name: "Colorful Overnight Oats", image: "/colorful-overnight-oats.png", calories: 310 },
  ],
  lunch: [
    {
      id: "l1",
      name: "Grilled Chicken Vegetable Medley",
      image: "/grilled-chicken-vegetable-medley.png",
      calories: 420,
    },
    { id: "l2", name: "Rainbow Grain Bowl", image: "/rainbow-grain-bowl.png", calories: 380 },
    { id: "l3", name: "Fresh Tuna Avocado Wrap", image: "/fresh-tuna-avocado-wrap.png", calories: 450 },
    { id: "l4", name: "Chicken Quinoa Power Bowl", image: "/chicken-quinoa-power-bowl.png", calories: 410 },
  ],
  dinner: [
    { id: "d1", name: "Pan Seared Salmon Quinoa", image: "/pan-seared-salmon-quinoa.png", calories: 480 },
    { id: "d2", name: "Savory Turkey Meatballs", image: "/savory-turkey-meatballs.png", calories: 420 },
    { id: "d3", name: "Vibrant Vegetable Stir Fry", image: "/vibrant-vegetable-stir-fry.png", calories: 350 },
    { id: "d4", name: "Classic Beef Broccoli", image: "/classic-beef-broccoli.png", calories: 460 },
  ],
  snack: [
    { id: "s1", name: "Greek Yogurt with Berries", image: "/placeholder.svg?height=160&width=160", calories: 150 },
    { id: "s2", name: "Protein Energy Bites", image: "/placeholder.svg?height=160&width=160", calories: 120 },
    { id: "s3", name: "Mixed Nuts and Dried Fruits", image: "/placeholder.svg?height=160&width=160", calories: 180 },
    { id: "s4", name: "Vegetable Sticks with Hummus", image: "/placeholder.svg?height=160&width=160", calories: 130 },
  ],
}

// Helper function to group dates by week
function groupDatesByWeek(dates: Date[]): Record<string, Date[]> {
  const weeks: Record<string, Date[]> = {}

  dates.forEach((date) => {
    const year = getYear(date)
    const week = getWeek(date, { weekStartsOn: 1 }) // Monday start
    const weekKey = `${year}-W${week}`

    if (!weeks[weekKey]) {
      weeks[weekKey] = []
    }
    weeks[weekKey].push(date)
  })

  return weeks
}

// Validation function for delivery days based on duration
function validateDeliveryDays(selectedDays: Date[], duration: number): string[] {
  const errors: string[] = []
  const totalDays = selectedDays.length

  if (duration === 1) {
    // 1 week: at least 3 days
    if (totalDays < 3) {
      errors.push("Choisis au moins 3 jours de livraison pour un abonnement d une semaine")
    }
  } else if (duration === 2) {
    // 2 weeks: at least 6 days total with at least 2 days in the second week
    if (totalDays < 6) {
      errors.push("Choisis au moins 6 jours de livraison pour un abonnement de deux semaines")
    } else {
      const weekGroups = groupDatesByWeek(selectedDays)
      const weeks = Object.keys(weekGroups).sort()

      if (weeks.length < 2) {
        errors.push("Repartis tes jours de livraison sur les deux semaines")
      } else {
        const secondWeekDays = weekGroups[weeks[1]]?.length || 0
        if (secondWeekDays < 2) {
          errors.push("Choisis au moins 2 jours de livraison la deuxieme semaine")
        }
      }
    }
  } else if (duration === 4) {
    // 1 month: at least 10 days total with at least 2 days in the second, third, and fourth weeks
    if (totalDays < 10) {
      errors.push("Choisis au moins 10 jours de livraison pour un abonnement d un mois")
    } else {
      const weekGroups = groupDatesByWeek(selectedDays)
      const weeks = Object.keys(weekGroups).sort()

      if (weeks.length < 4) {
        errors.push("Repartis tes jours de livraison sur les 4 semaines")
      } else {
        // Check weeks 2, 3, and 4 have at least 2 days each
        for (let i = 1; i < 4; i++) {
          const weekDays = weekGroups[weeks[i]]?.length || 0
          if (weekDays < 2) {
            errors.push(`Choisis au moins 2 jours de livraison en semaine ${i + 1}`)
            break
          }
        }
      }
    }
  }

  return errors
}

export function OrderProcess() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planIdFromUrl = searchParams.get("plan")

  const mappedPlanId = planIdFromUrl === "balanced-nutrition" ? "stay-fit" : planIdFromUrl

  const [selectedPlanId, setSelectedPlanId] = useState<string>(mappedPlanId || "")
  const selectedPlan = selectedPlanId ? mealPlans[selectedPlanId as keyof typeof mealPlans] : null

  const [selectedMealTypes, setSelectedMealTypes] = useState<string[]>(["lunch", "dinner"])
  const [selectedSnacks, setSelectedSnacks] = useState("0-snacks")
  const [duration, setDuration] = useState(1) // Default to 1 week
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([])
  const [selectedDays, setSelectedDays] = useState<Date[]>([])
  const [promoCode, setPromoCode] = useState("")

  const [step, setStep] = useState(1)
  const [menuSelections, setMenuSelections] = useState<Record<string, Record<string, any>>>({})
  const [errors, setErrors] = useState<{
    mealPlan?: string
    mealTypes?: string
    days?: string
    menu?: string
  }>({})

  // Pricing calculation state (from the DB-driven engine)
  const [pricing, setPricing] = useState<Pricing | null>(null)
  const [pricingError, setPricingError] = useState<string>("")
  const [pricingLoading, setPricingLoading] = useState(false)

  // Calendar rules - Fixed: Proper calculation for 1 month = 4 weeks
  const today = new Date()
  const weekStartsOn = 1 as const // Monday

  // Fixed calculation: 1 month should show 5 weeks (current + 4 weeks)
  const allowedWeeks = duration === 1 ? 2 : duration === 2 ? 3 : duration === 4 ? 5 : 4

  const allowedStart = startOfWeek(today, { weekStartsOn })
  const allowedEnd = addDays(allowedStart, allowedWeeks * 7 - 1)
  const todayStart = startOfDay(today)

  const sortedSelectedDays = [...selectedDays].sort((a, b) => a.getTime() - b.getTime())
  const startDate = sortedSelectedDays.length > 0 ? sortedSelectedDays[0] : undefined

  // Calculate pricing whenever selection changes - DB-driven engine.
  useEffect(() => {
    const planName = selectedPlanId ? mealPlans[selectedPlanId as keyof typeof mealPlans]?.title : ""
    const totalDays = selectedDays.length

    if (!planName || totalDays < 3) {
      setPricing(null)
      return
    }

    const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
    const snackCount = snackOptions.find((o) => o.id === selectedSnacks)?.value || 0
    const meals = [...selectedMealTypes.map(cap), ...Array.from({ length: snackCount }, () => "Snack")]
    const weeks = durationOptions.find((o) => o.value === duration)?.weeks || 1
    const daysPerWeek = Math.min(7, Math.max(1, Math.round(totalDays / weeks)))

    let ignore = false
    setPricingLoading(true)
    ;(async () => {
      try {
        const res = await fetch("/api/calculate-price", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: planName, meals, days: daysPerWeek, duration: weeks }),
        })
        const json = await res.json()
        if (ignore) return
        if (!res.ok) {
          setPricingError(json?.error || "Pricing unavailable")
          setPricing(null)
          return
        }
        const calc = json.calculation || json.data || json
        const pricePerDay = Number(calc.pricePerDay) || 0
        const gross = Number(calc.grossWeekly) || 0
        const final = Number(calc.finalWeekly) || 0
        const rate = gross > 0 ? (gross - final) / gross : 0
        const subtotal = Math.round(pricePerDay * totalDays * 100) / 100
        const discountAmount = Math.round(subtotal * rate * 100) / 100
        const label =
          Array.isArray(calc.discountsApplied) && calc.discountsApplied.length
            ? calc.discountsApplied.map((d: any) => `${d.type} ${d.percentage}%`).join(" + ")
            : ""
        setPricing({
          pricePerDay,
          totalDays,
          weeks,
          subtotal,
          discountPct: Math.round(rate * 1000) / 10,
          discountLabel: label,
          discountAmount,
          total: Math.round((subtotal - discountAmount) * 100) / 100,
        })
        setPricingError("")
      } catch (e) {
        if (ignore) return
        setPricingError(e instanceof Error ? e.message : "Pricing calculation error")
        setPricing(null)
      } finally {
        if (!ignore) setPricingLoading(false)
      }
    })()

    return () => {
      ignore = true
    }
  }, [selectedPlanId, selectedMealTypes, selectedSnacks, selectedDays, duration])

  // Reset selected days if duration changes and selected days fall outside the new range
  useEffect(() => {
    const filteredDays = selectedDays.filter((day) => {
      const t = startOfDay(day)
      return !isBefore(t, todayStart) && !isAfter(t, allowedEnd)
    })
    if (filteredDays.length !== selectedDays.length) {
      setSelectedDays(filteredDays)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, allowedEnd, todayStart])

  // Initialize menu selections when days change
  useEffect(() => {
    const newMenuSelections: Record<string, Record<string, any>> = {}
    selectedDays.forEach((day) => {
      const dayKey = day.toISOString()
      newMenuSelections[dayKey] = {}
      selectedMealTypes.forEach((mealType) => {
        newMenuSelections[dayKey][mealType] = null
      })
      if (selectedSnacks === "1-snack") {
        newMenuSelections[dayKey]["snack1"] = null
      } else if (selectedSnacks === "2-snacks") {
        newMenuSelections[dayKey]["snack1"] = null
        newMenuSelections[dayKey]["snack2"] = null
      }
    })
    setMenuSelections(newMenuSelections)
  }, [selectedDays, selectedMealTypes, selectedSnacks])

  const handleMealTypeToggle = (mealTypeId: string) => {
    setSelectedMealTypes((prev) => {
      if (prev.includes(mealTypeId) && prev.length <= 2) return prev
      return prev.includes(mealTypeId) ? prev.filter((id) => id !== mealTypeId) : [...prev, mealTypeId]
    })
  }

  const handleAllergyToggle = (allergyId: string) => {
    setSelectedAllergies((prev) =>
      prev.includes(allergyId) ? prev.filter((id) => id !== allergyId) : [...prev, allergyId],
    )
  }

  const handleMealSelection = (day: Date, mealType: string, meal: any) => {
    const dayKey = day.toISOString()
    setMenuSelections((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        [mealType]: meal,
      },
    }))
  }

  const isMenuComplete = () => {
    for (const day of selectedDays) {
      const dayKey = day.toISOString()
      for (const mealType of selectedMealTypes) {
        if (!menuSelections[dayKey]?.[mealType]) return false
      }
      if (selectedSnacks === "1-snack" && !menuSelections[dayKey]?.["snack1"]) return false
      if (selectedSnacks === "2-snacks" && (!menuSelections[dayKey]?.["snack1"] || !menuSelections[dayKey]?.["snack2"]))
        return false
    }
    return selectedDays.length > 0
  }

  const validateStep = () => {
    const newErrors: typeof errors = {}
    if (step === 1) {
      if (!selectedPlanId) newErrors.mealPlan = "Choisis un programme"
      if (selectedMealTypes.length < 2) newErrors.mealTypes = "Choisis au moins 2 repas"

      // Use ONLY the new validation logic - remove any old per-week limits
      const dayValidationErrors = validateDeliveryDays(selectedDays, duration)
      if (dayValidationErrors.length > 0) {
        newErrors.days = dayValidationErrors[0] // Show first error
      }
    } else if (step === 2) {
      if (!isMenuComplete()) newErrors.menu = "Choisis tous les plats de ton plan"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep()) {
      if (step < 2) {
        setStep(step + 1)
        window.scrollTo(0, 0)
      } else {
        const mealPlanData = {
          planId: selectedPlanId,
          planName: selectedPlan?.title,
          planPrice: pricing?.total || 0,
          duration: `${selectedDays.length} jours`,
          subscriptionWeeks: durationOptions.find((opt) => opt.value === duration)?.weeks || 1,
          customizations: {
            dietaryRestrictions: selectedAllergies
              .map((id) => allergies.find((a) => a.id === id)?.label)
              .filter(Boolean),
            mealTypes: selectedMealTypes,
            snacks: selectedSnacks,
          },
          deliverySchedule: {
            frequency: "Custom",
            selectedDays: sortedSelectedDays.map((d) => d.toISOString()),
            startDate: startDate?.toISOString(),
          },
          pricing: pricing,
        }
        localStorage.setItem("selectedMealPlan", JSON.stringify(mealPlanData))
        router.push("/checkout")
      }
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
      window.scrollTo(0, 0)
    } else {
      router.push(selectedPlanId ? `/meal-plans/${selectedPlanId}` : "/meal-plans")
    }
  }

  // Check if current selection meets minimum requirements
  const meetsMinimumRequirements = () => {
    const dayValidationErrors = validateDeliveryDays(selectedDays, duration)
    return selectedPlanId && selectedMealTypes.length >= 2 && dayValidationErrors.length === 0
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-12 pb-28 lg:pb-12">
      <div className="mb-8">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          {step === 1 ? "Retour aux programmes" : "Retour"}
        </Button>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">Compose ton plan</h1>
          <div className="hidden md:flex items-center space-x-2 text-sm">
            <div
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full",
                step >= 1 ? "bg-fitnest-green text-white" : "bg-gray-200 text-gray-500",
              )}
            >
              1
            </div>
            <div className={cn("w-8 h-0.5", step >= 2 ? "bg-fitnest-green" : "bg-gray-200")} />
            <div
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full",
                step >= 2 ? "bg-fitnest-green text-white" : "bg-gray-200 text-gray-500",
              )}
            >
              2
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Compose ton plan</CardTitle>
                <CardDescription>Choisis ton programme, tes repas, tes jours et la duree.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Meal Plan Selection */}
                <div>
                  <Label className="text-base font-medium mb-3 block">Choisis ton programme</Label>
                  <RadioGroup
                    value={selectedPlanId}
                    onValueChange={setSelectedPlanId}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {Object.entries(mealPlans).map(([id, plan]) => (
                      <div key={id}>
                        <RadioGroupItem value={id} id={`plan-${id}`} className="peer sr-only" />
                        <Label
                          htmlFor={`plan-${id}`}
                          className="flex items-center space-x-4 rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 hover:border-gray-200 peer-data-[state=checked]:border-fitnest-green [&:has([data-state=checked])]:border-fitnest-green cursor-pointer"
                        >
                          <div className="relative h-16 w-16 overflow-hidden rounded-md">
                            <Image
                              src={plan.image || "/placeholder.svg?height=64&width=64&query=meal+plan"}
                              alt={plan.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold">{plan.title}</h3>
                            <p className="text-sm text-gray-500">{plan.description}</p>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {errors.mealPlan && <p className="text-red-500 text-sm mt-2">{errors.mealPlan}</p>}
                </div>

                {/* Meal Types Selection */}
                <div>
                  <Label className="text-base font-medium mb-3 block">Combien de repas par jour ?</Label>
                  <p className="text-sm text-gray-500 mb-4">Choisis au moins 2 repas, dont le dejeuner ou le diner.</p>
                  <div className="grid grid-cols-3 gap-2 md:gap-4">
                    {mealTypes.map((mealType) => (
                      <div key={mealType.id} className="relative">
                        <input
                          type="checkbox"
                          id={`meal-type-${mealType.id}`}
                          checked={selectedMealTypes.includes(mealType.id)}
                          onChange={() =>
                            setSelectedMealTypes((prev) =>
                              prev.includes(mealType.id)
                                ? prev.filter((id) => id !== mealType.id)
                                : [...prev, mealType.id],
                            )
                          }
                          className="peer sr-only"
                        />
                        <label
                          htmlFor={`meal-type-${mealType.id}`}
                          className={cn(
                            "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 hover:border-gray-200 cursor-pointer",
                            selectedMealTypes.includes(mealType.id) ? "border-fitnest-green" : "",
                          )}
                        >
                          {selectedMealTypes.includes(mealType.id) && (
                            <div className="absolute top-2 right-2 h-5 w-5 bg-fitnest-green rounded-full flex items-center justify-center">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                          <div className="text-center">
                            <h3 className="font-semibold text-sm md:text-base">{mealType.label}</h3>
                            <p className="text-xs text-gray-500 hidden sm:block">{mealType.description}</p>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                  {errors.mealTypes && <p className="text-red-500 text-sm mt-2">{errors.mealTypes}</p>}
                </div>

                {/* Snacks Selection */}
                <div>
                  <Label className="text-base font-medium mb-3 block">Combien de collations par jour ?</Label>
                  <RadioGroup
                    value={selectedSnacks}
                    onValueChange={setSelectedSnacks}
                    className="grid grid-cols-3 gap-2 md:gap-4"
                  >
                    {snackOptions.map((option) => (
                      <div key={option.id}>
                        <RadioGroupItem value={option.id} id={`snack-${option.id}`} className="peer sr-only" />
                        <Label
                          htmlFor={`snack-${option.id}`}
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 hover:border-gray-200 peer-data-[state=checked]:border-fitnest-green [&:has([data-state=checked])]:border-fitnest-green cursor-pointer"
                        >
                          <div className="text-center">
                            <h3 className="font-semibold text-sm md:text-base">{option.label}</h3>
                            <p className="text-xs text-gray-500 hidden sm:block">{option.description}</p>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Duration Selection */}
                <div>
                  <Label className="text-base font-medium mb-3 block">Duree de l abonnement</Label>
                  <RadioGroup
                    value={String(duration)}
                    onValueChange={(value) => setDuration(Number(value))}
                    className="grid grid-cols-3 gap-2 md:gap-4"
                  >
                    {durationOptions.map((option) => (
                      <div key={option.value}>
                        <RadioGroupItem
                          value={String(option.value)}
                          id={`duration-${option.value}`}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={`duration-${option.value}`}
                          className="relative flex flex-col items-center justify-center rounded-md border-2 border-muted bg-white p-4 h-full hover:bg-gray-50 hover:border-gray-200 peer-data-[state=checked]:border-fitnest-green [&:has([data-state=checked])]:border-fitnest-green cursor-pointer"
                        >
                          <h3 className="font-semibold">{option.label}</h3>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Promo Code */}
                <div>
                  <Label className="text-base font-medium mb-3 block">Code promo (optionnel)</Label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="Saisis ton code promo"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fitnest-green focus:border-transparent"
                    />
                    <Button type="button" variant="outline" onClick={() => setPromoCode("")} disabled={!promoCode}>
                      Effacer
                    </Button>
                  </div>
                  {promoCode && (
                    <p className="text-gray-500 text-xs mt-2">Les codes promo sont appliques au paiement.</p>
                  )}
                </div>

                {/* Calendar Day Selection */}
                <div>
                  <Label className="text-base font-medium mb-3 block">Choisis tes jours de livraison</Label>
                  <p className="text-sm text-gray-500 mb-4">
                    Clique sur les dates ou tu souhaites etre livre.
                    {duration === 1 && " Au moins 3 jours."}
                    {duration === 2 && " Au moins 6 jours, dont 2 la deuxieme semaine."}
                    {duration === 4 && " Au moins 10 jours, dont 2 par semaine sur les semaines 2, 3 et 4."}
                  </p>
                  <DeliveryCalendar
                    allowedWeeks={allowedWeeks}
                    value={selectedDays}
                    onChange={(days) => setSelectedDays(days)}
                    className="w-full"
                  />
                  {errors.days && <p className="text-red-500 text-sm mt-2">{errors.days}</p>}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  Retour
                </Button>
                <Button onClick={handleNext} disabled={!meetsMinimumRequirements()}>
                  Continuer vers le menu
                </Button>
              </CardFooter>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Compose ton menu</CardTitle>
                <CardDescription>Choisis tes plats pour chaque jour de livraison.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {errors.menu && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erreur</AlertTitle>
                    <AlertDescription>{errors.menu}</AlertDescription>
                  </Alert>
                )}

                <Accordion type="single" collapsible className="w-full" defaultValue={startDate?.toISOString()}>
                  {sortedSelectedDays.map((day) => (
                    <AccordionItem key={day.toISOString()} value={day.toISOString()}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium">{format(day, "EEEE, MMM d")}</span>
                          {Object.keys(menuSelections[day.toISOString()] || {}).every(
                            (mealType) => menuSelections[day.toISOString()]?.[mealType],
                          ) ? (
                            <span className="text-sm text-green-600 mr-2 flex items-center">
                              <Check className="h-4 w-4 mr-1" /> Complet
                            </span>
                          ) : (
                            <span className="text-sm text-amber-600 mr-2">A completer</span>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-6 pt-2">
                          {/* Render meal selectors for each meal type */}
                          {selectedMealTypes.map((mealType) => (
                            <div key={`${day.toISOString()}-${mealType}`} className="border rounded-lg p-4">
                              <h4 className="font-medium text-base mb-4 capitalize">{mealType}</h4>
                              {menuSelections[day.toISOString()]?.[mealType] ? (
                                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                                  <div className="flex items-center">
                                    <div className="relative h-16 w-16 overflow-hidden rounded-md mr-3">
                                      <Image
                                        src={
                                          menuSelections[day.toISOString()][mealType].image ||
                                          "/placeholder.svg?height=64&width=64&query=meal" ||
                                          "/placeholder.svg"
                                        }
                                        alt={menuSelections[day.toISOString()][mealType].name}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                    <div>
                                      <h5 className="font-medium">
                                        {menuSelections[day.toISOString()][mealType].name}
                                      </h5>
                                      <p className="text-sm text-gray-500">
                                        {menuSelections[day.toISOString()][mealType].calories} kcal
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleMealSelection(day, mealType, null)}
                                  >
                                    Change
                                  </Button>
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                  {sampleMeals[mealType as keyof typeof sampleMeals].map((option) => (
                                    <div
                                      key={option.id}
                                      className="border rounded-md overflow-hidden cursor-pointer hover:border-fitnest-green transition-colors"
                                      onClick={() => handleMealSelection(day, mealType, option)}
                                    >
                                      <div className="relative h-32 w-full">
                                        <Image
                                          src={
                                            option.image || "/placeholder.svg?height=128&width=192&query=meal+option"
                                          }
                                          alt={option.name}
                                          fill
                                          className="object-cover"
                                        />
                                      </div>
                                      <div className="p-2">
                                        <h5 className="font-medium text-sm">{option.name}</h5>
                                        <p className="text-xs text-gray-500">{option.calories} kcal</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                          {/* Render snack selectors */}
                          {Array.from({
                            length: selectedSnacks === "1-snack" ? 1 : selectedSnacks === "2-snacks" ? 2 : 0,
                          }).map((_, i) => {
                            const snackKey = `snack${i + 1}`
                            return (
                              <div key={`${day.toISOString()}-${snackKey}`} className="border rounded-lg p-4">
                                <h4 className="font-medium text-base mb-4 capitalize">
                                  {i > 0 ? "Deuxieme collation" : "Collation"}
                                </h4>
                                {menuSelections[day.toISOString()]?.[snackKey] ? (
                                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                                    <div className="flex items-center">
                                      <div className="relative h-16 w-16 overflow-hidden rounded-md mr-3">
                                        <Image
                                          src={
                                            menuSelections[day.toISOString()][snackKey].image ||
                                            "/placeholder.svg?height=64&width=64&query=snack" ||
                                            "/placeholder.svg"
                                          }
                                          alt={menuSelections[day.toISOString()][snackKey].name}
                                          fill
                                          className="object-cover"
                                        />
                                      </div>
                                      <div>
                                        <h5 className="font-medium">
                                          {menuSelections[day.toISOString()][snackKey].name}
                                        </h5>
                                        <p className="text-sm text-gray-500">
                                          {menuSelections[day.toISOString()][snackKey].calories} kcal
                                        </p>
                                      </div>
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleMealSelection(day, snackKey, null)}
                                    >
                                      Change
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                    {sampleMeals["snack"].map((option) => (
                                      <div
                                        key={option.id}
                                        className="border rounded-md overflow-hidden cursor-pointer hover:border-fitnest-green transition-colors"
                                        onClick={() => handleMealSelection(day, snackKey, option)}
                                      >
                                        <div className="relative h-32 w-full">
                                          <Image
                                            src={
                                              option.image || "/placeholder.svg?height=128&width=192&query=snack+option"
                                            }
                                            alt={option.name}
                                            fill
                                            className="object-cover"
                                          />
                                        </div>
                                        <div className="p-2">
                                          <h5 className="font-medium text-sm">{option.name}</h5>
                                          <p className="text-xs text-gray-500">{option.calories} kcal</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  Retour
                </Button>
                <Button
                  onClick={handleNext}
                  className="bg-fitnest-orange hover:bg-fitnest-orange/90"
                  disabled={!isMenuComplete()}
                >
                  Passer au paiement
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <Card>
              <CardHeader>
                <CardTitle>Recapitulatif</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedPlan && (
                  <div className="flex items-center space-x-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-md">
                      <Image
                        src={selectedPlan.image || "/placeholder.svg?height=64&width=64&query=plan"}
                        alt={selectedPlan.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold">{selectedPlan.title}</h3>
                      <p className="text-sm text-gray-500">
                        {selectedMealTypes.length} repas,{" "}
                        {selectedSnacks !== "0-snacks"
                          ? selectedSnacks === "1-snack"
                            ? "1 collation"
                            : "2 collations"
                          : "sans collation"}
                      </p>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Programme :</span>
                    <span>{selectedPlan?.title || "Non selectionne"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Repas par jour :</span>
                    <span>{selectedMealTypes.length} repas</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Collations par jour :</span>
                    <span>
                      {selectedSnacks === "0-snacks"
                        ? "Sans collation"
                        : selectedSnacks === "1-snack"
                          ? "1 collation"
                          : "2 collations"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Jours de livraison :</span>
                    <span>{selectedDays.length} jours</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Duree :</span>
                    <span>{durationOptions.find((opt) => opt.value === duration)?.label}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Debut :</span>
                    <span>{startDate ? format(startDate, "MMM d, yyyy") : "Non selectionne"}</span>
                  </div>
                </div>

                <Separator />

                {/* Pricing Breakdown - DB-driven engine */}
                {pricingLoading && !pricing && <p className="text-sm text-gray-500">Calcul du prix...</p>}
                {pricing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Cout par jour :</span>
                      <span>{formatPrice(pricing.pricePerDay)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Sous-total ({pricing.totalDays} jours) :</span>
                      <span>{formatPrice(pricing.subtotal)}</span>
                    </div>
                    {pricing.discountAmount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Remise{pricing.discountLabel ? ` (${pricing.discountLabel})` : ""}:</span>
                        <span>-{formatPrice(pricing.discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                      <span>Total :</span>
                      <span>{formatPrice(pricing.total)}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {pricing.weeks} semaine{pricing.weeks > 1 ? "s" : ""} - {pricing.totalDays} livraisons
                    </div>
                  </div>
                )}

                {pricingError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{pricingError}</AlertDescription>
                  </Alert>
                )}

                <div className="rounded-md bg-gray-50 p-3">
                  <div className="flex">
                    <Info className="h-5 w-5 text-fitnest-orange mr-2" />
                    <div className="text-sm text-gray-600">
                      <p className="font-medium">Abonnement flexible</p>
                      <p>Tu peux mettre en pause, modifier ou annuler a tout moment.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                {step === 2 ? (
                  <Button
                    onClick={handleNext}
                    className="w-full bg-fitnest-orange hover:bg-fitnest-orange/90"
                    disabled={!isMenuComplete()}
                  >
                    Passer au paiement
                  </Button>
                ) : (
                  <Button className="w-full" onClick={handleNext} disabled={!meetsMinimumRequirements()}>
                    Continuer vers le menu
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile sticky total bar */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t bg-white p-3 shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
        <div className="container mx-auto flex items-center justify-between gap-3">
          <div className="leading-tight">
            <div className="text-xs text-gray-500">
              {pricing ? `${pricing.totalDays} jours - ${pricing.weeks} sem.` : "Compose ton plan"}
            </div>
            <div className="text-lg font-semibold">{pricing ? formatPrice(pricing.total) : "-"}</div>
          </div>
          <Button
            onClick={handleNext}
            disabled={step === 1 ? !meetsMinimumRequirements() : !isMenuComplete()}
            className={cn(step === 2 && "bg-fitnest-orange hover:bg-fitnest-orange/90")}
          >
            {step === 1 ? "Continuer" : "Paiement"}
          </Button>
        </div>
      </div>
    </div>
  )
}
