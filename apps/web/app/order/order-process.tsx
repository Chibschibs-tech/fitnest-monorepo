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
import { calculatePrice, type MealSelection, type PriceBreakdown, formatPrice } from "@/lib/pricing-model"

// Define meal plan data
const mealPlans = {
  "weight-loss": {
    title: "Weight Loss",
    description:
      "Repas contrôlés en calories (1200-1500 kcal/jour) pour perdre du poids tout en restant rassasié.",
    basePrice: 350,
    image: "/vibrant-weight-loss-meal.png",
  },
  "stay-fit": {
    title: "Stay Fit",
    description:
      "Repas équilibrés (1600-1900 kcal/jour) avec une répartition optimale des macronutriments.",
    basePrice: 320,
    image: "/vibrant-nutrition-plate.png",
  },
  "muscle-gain": {
    title: "Muscle Gain",
    description:
      "Repas riches en protéines (2200-2500 kcal/jour) pour la croissance musculaire et la récupération.",
    basePrice: 400,
    image: "/hearty-muscle-meal.png",
  },
  keto: {
    title: "Keto",
    description:
      "Repas faibles en glucides et riches en lipides sains (1700-1900 kcal/jour) pour la cétose.",
    basePrice: 380,
    image: "/colorful-keto-plate.png",
  },
}

const mealTypes = [
  { id: "breakfast", label: "Petit-déjeuner", description: "Commencez la journée du bon pied" },
  { id: "lunch", label: "Déjeuner", description: "Énergie pour l'après-midi" },
  { id: "dinner", label: "Dîner", description: "Repas du soir équilibré" },
]

const snackOptions = [
  { id: "0-snacks", label: "Sans collation", description: "Aucune collation supplémentaire", value: 0 },
  { id: "1-snack", label: "1 collation / jour", description: "Une collation saine par jour", value: 1 },
  { id: "2-snacks", label: "2 collations / jour", description: "Deux collations saines par jour", value: 2 },
]

const allergies = [
  { id: "dairy", label: "Produits laitiers", description: "Lait, fromage, yaourt" },
  { id: "gluten", label: "Gluten", description: "Blé, orge, seigle" },
  { id: "nuts", label: "Fruits à coque", description: "Arachides, noix" },
  { id: "shellfish", label: "Fruits de mer", description: "Crevettes, crabe, homard" },
  { id: "eggs", label: "Œufs", description: "Œufs de poule" },
  { id: "soy", label: "Soja", description: "Soja et dérivés" },
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
      errors.push("Veuillez sélectionner au moins 3 jours de livraison pour un abonnement d'1 semaine")
    }
  } else if (duration === 2) {
    // 2 weeks: at least 6 days total with at least 2 days in the second week
    if (totalDays < 6) {
      errors.push("Veuillez sélectionner au moins 6 jours de livraison pour un abonnement de 2 semaines")
    } else {
      const weekGroups = groupDatesByWeek(selectedDays)
      const weeks = Object.keys(weekGroups).sort()

      if (weeks.length < 2) {
        errors.push("Veuillez sélectionner des jours de livraison sur les deux semaines")
      } else {
        const secondWeekDays = weekGroups[weeks[1]]?.length || 0
        if (secondWeekDays < 2) {
          errors.push("Veuillez sélectionner au moins 2 jours de livraison la deuxième semaine")
        }
      }
    }
  } else if (duration === 4) {
    // 1 month: at least 10 days total with at least 2 days in the second, third, and fourth weeks
    if (totalDays < 10) {
      errors.push("Veuillez sélectionner au moins 10 jours de livraison pour un abonnement d'1 mois")
    } else {
      const weekGroups = groupDatesByWeek(selectedDays)
      const weeks = Object.keys(weekGroups).sort()

      if (weeks.length < 4) {
        errors.push("Veuillez sélectionner des jours de livraison sur les 4 semaines")
      } else {
        // Check weeks 2, 3, and 4 have at least 2 days each
        for (let i = 1; i < 4; i++) {
          const weekDays = weekGroups[weeks[i]]?.length || 0
          if (weekDays < 2) {
            errors.push(`Veuillez sélectionner au moins 2 jours de livraison la semaine ${i + 1}`)
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

  const mappedPlanId = planIdFromUrl

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

  // Pricing calculation state
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null)
  const [pricingError, setPricingError] = useState<string>("")

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

  // Calculate pricing whenever selection changes
  useEffect(() => {
    if (selectedPlanId && selectedDays.length >= 3) {
      try {
        const selection: MealSelection = {
          planId: selectedPlanId,
          mainMeals: selectedMealTypes.includes("lunch") && selectedMealTypes.includes("dinner") ? 2 : 1,
          breakfast: selectedMealTypes.includes("breakfast"),
          snacks: snackOptions.find((opt) => opt.id === selectedSnacks)?.value || 0,
          selectedDays: selectedDays,
          subscriptionWeeks: durationOptions.find((opt) => opt.value === duration)?.weeks || 1,
          promoCode: promoCode || undefined,
        }

        const breakdown = calculatePrice(selection, promoCode || undefined)
        setPriceBreakdown(breakdown)
        setPricingError("")
      } catch (error) {
        setPricingError(error instanceof Error ? error.message : "Erreur de calcul du prix")
        setPriceBreakdown(null)
      }
    }
  }, [selectedPlanId, selectedMealTypes, selectedSnacks, selectedDays, duration, promoCode])

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
      if (!selectedPlanId) newErrors.mealPlan = "Veuillez sélectionner une formule"
      if (selectedMealTypes.length < 2) newErrors.mealTypes = "Veuillez sélectionner au moins 2 types de repas"

      // Use ONLY the new validation logic - remove any old per-week limits
      const dayValidationErrors = validateDeliveryDays(selectedDays, duration)
      if (dayValidationErrors.length > 0) {
        newErrors.days = dayValidationErrors[0] // Show first error
      }
    } else if (step === 2) {
      if (!isMenuComplete()) newErrors.menu = "Veuillez sélectionner tous les repas de votre formule"
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
        const subscriptionWeeks = durationOptions.find((opt) => opt.value === duration)?.weeks || 1
        const mealPlanData = {
          planId: selectedPlanId,
          planName: selectedPlan?.title,
          planPrice: priceBreakdown?.finalTotal || 0,
          duration: `${subscriptionWeeks} semaine${subscriptionWeeks > 1 ? "s" : ""}`,
          subscriptionWeeks,
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
          priceBreakdown: priceBreakdown,
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
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          {step === 1 ? "Retour aux formules" : "Retour"}
        </Button>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">Personnalisez votre formule repas idéale</h1>
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
                <CardTitle>Choisissez vos options</CardTitle>
                <CardDescription>Personnalisez votre formule selon vos besoins</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Meal Plan Selection */}
                <div>
                  <Label className="text-base font-medium mb-3 block">Choisissez votre formule</Label>
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
                  <p className="text-sm text-gray-500 mb-4">Sélectionnez au moins 2 repas, incluant le déjeuner ou le dîner.</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            <h3 className="font-semibold">{mealType.label}</h3>
                            <p className="text-sm text-gray-500">{mealType.description}</p>
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
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    {snackOptions.map((option) => (
                      <div key={option.id}>
                        <RadioGroupItem value={option.id} id={`snack-${option.id}`} className="peer sr-only" />
                        <Label
                          htmlFor={`snack-${option.id}`}
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 hover:border-gray-200 peer-data-[state=checked]:border-fitnest-green [&:has([data-state=checked])]:border-fitnest-green cursor-pointer"
                        >
                          <div className="text-center">
                            <h3 className="font-semibold">{option.label}</h3>
                            <p className="text-sm text-gray-500">{option.description}</p>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Duration Selection */}
                <div>
                  <Label className="text-base font-medium mb-3 block">Durée de l'abonnement</Label>
                  <RadioGroup
                    value={String(duration)}
                    onValueChange={(value) => setDuration(Number(value))}
                    className="grid gap-4 md:grid-cols-3"
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
                  <Label className="text-base font-medium mb-3 block">Code promo (Optionnel)</Label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="Entrez votre code promo"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fitnest-green focus:border-transparent"
                    />
                    <Button type="button" variant="outline" onClick={() => setPromoCode("")} disabled={!promoCode}>
                      Effacer
                    </Button>
                  </div>
                  {promoCode && priceBreakdown?.discounts.seasonalDiscount > 0 && (
                    <p className="text-green-600 text-sm mt-2">
                      ✓ Code promo appliqué ! Économisez {formatPrice(priceBreakdown.discounts.seasonalDiscount)}
                    </p>
                  )}
                </div>

                {/* Calendar Day Selection */}
                <div>
                  <Label className="text-base font-medium mb-3 block">Sélectionnez vos jours de livraison</Label>
                  <p className="text-sm text-gray-500 mb-4">
                    Cliquez sur les dates auxquelles vous souhaitez recevoir vos repas.
                    {duration === 1 && " Sélectionnez au moins 3 jours."}
                    {duration === 2 && " Sélectionnez au moins 6 jours avec minimum 2 jours la deuxième semaine."}
                    {duration === 4 && " Sélectionnez au moins 10 jours avec minimum 2 jours les semaines 2, 3 et 4."}
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
                  Continuer vers la composition du menu
                </Button>
              </CardFooter>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Composez votre menu</CardTitle>
                <CardDescription>Sélectionnez vos repas pour chaque jour de votre formule</CardDescription>
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
                            <span className="text-sm text-amber-600 mr-2">Incomplet</span>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-6 pt-2">
                          {/* Render meal selectors for each meal type */}
                          {selectedMealTypes.map((mealType) => (
                            <div key={`${day.toISOString()}-${mealType}`} className="border rounded-lg p-4">
                              <h4 className="font-medium text-base mb-4">{mealTypes.find(mt => mt.id === mealType)?.label || mealType}</h4>
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
                                        {menuSelections[day.toISOString()][mealType].calories} calories
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleMealSelection(day, mealType, null)}
                                  >
                                    Changer
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
                                        <p className="text-xs text-gray-500">{option.calories} calories</p>
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
                                  {i > 0 ? "Deuxième collation" : "Collation"}
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
                                          {menuSelections[day.toISOString()][snackKey].calories} calories
                                        </p>
                                      </div>
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleMealSelection(day, snackKey, null)}
                                    >
                                      Changer
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
                                          <p className="text-xs text-gray-500">{option.calories} calories</p>
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
                <CardTitle>Résumé de la commande</CardTitle>
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
                    <span>Formule :</span>
                    <span>{selectedPlan?.title || "Non sélectionnée"}</span>
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
                    <span>Durée :</span>
                    <span>{durationOptions.find((opt) => opt.value === duration)?.label}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Date de début :</span>
                    <span>{startDate ? format(startDate, "d MMM yyyy") : "Non sélectionnée"}</span>
                  </div>
                </div>

                <Separator />

                {/* Pricing Breakdown - UPDATED: Better display for multi-week subscriptions */}
                {priceBreakdown && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Coût par jour :</span>
                      <span>{formatPrice(priceBreakdown.pricePerDay)}</span>
                    </div>

                    {/* Only show weekly cost for 1-week subscriptions */}
                    {duration === 1 && (
                      <div className="flex justify-between text-sm">
                        <span>Coût hebdomadaire :</span>
                        <span>{formatPrice(priceBreakdown.pricePerWeek)}</span>
                      </div>
                    )}

                    {priceBreakdown.discounts.totalDiscount > 0 && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span>Sous-total :</span>
                          <span>
                            {formatPrice(
                              priceBreakdown.subscriptionTotals.subscriptionSubtotal +
                                priceBreakdown.discounts.totalDiscount,
                            )}
                          </span>
                        </div>

                        {priceBreakdown.discounts.appliedWeeklyDiscount > 0 && (
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Réduction volume ({priceBreakdown.discounts.appliedWeeklyDiscount}%) :</span>
                            <span>
                              -
                              {formatPrice(
                                priceBreakdown.discounts.totalDiscount -
                                  priceBreakdown.discounts.durationDiscount -
                                  priceBreakdown.discounts.seasonalDiscount,
                              )}
                            </span>
                          </div>
                        )}

                        {priceBreakdown.discounts.durationDiscount > 0 && (
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Réduction durée :</span>
                            <span>-{formatPrice(priceBreakdown.discounts.durationDiscount)}</span>
                          </div>
                        )}

                        {priceBreakdown.discounts.seasonalDiscount > 0 && (
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Réduction promo :</span>
                            <span>-{formatPrice(priceBreakdown.discounts.seasonalDiscount)}</span>
                          </div>
                        )}

                        <div className="flex justify-between text-sm font-medium text-green-600">
                          <span>Économies totales :</span>
                          <span>-{formatPrice(priceBreakdown.discounts.totalDiscount)}</span>
                        </div>
                      </>
                    )}

                    <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                      <span>Total final :</span>
                      <span>{formatPrice(priceBreakdown.finalTotal)}</span>
                    </div>

                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Total articles : {priceBreakdown.totalItems}</div>
                      <div>
                        Durée : {priceBreakdown.totalWeeks} semaine{priceBreakdown.totalWeeks > 1 ? "s" : ""}
                      </div>
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
                      <p>Vous pouvez suspendre, modifier ou annuler votre abonnement à tout moment.</p>
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
                    Continuer vers la composition du menu
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
