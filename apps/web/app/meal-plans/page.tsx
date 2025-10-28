import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Define meal plan data
const mealPlans = [
  {
    id: "weight-loss",
    title: "Weight Loss",
    description: "Designed to help you lose weight while maintaining energy and satisfaction.",
    calories: "1200-1500 calories per day",
    price: "Starting from 140 MAD/week",
    features: [
      "High protein, low carb meals",
      "Calorie-controlled portions",
      "Nutrient-dense ingredients",
      "Satisfying and filling options",
    ],
    image: "/vibrant-weight-loss-meal.png",
    color: "green",
  },
  {
    id: "balanced-nutrition",
    title: "Stay Fit",
    description: "Perfect for maintaining a healthy lifestyle with well-rounded nutrition.",
    calories: "1600-1900 calories per day",
    price: "Starting from 160 MAD/week",
    features: [
      "Balanced macronutrients",
      "Variety of ingredients",
      "Rich in vitamins and minerals",
      "Sustainable eating pattern",
    ],
    image: "/vibrant-nutrition-plate.png",
    color: "blue",
  },
  {
    id: "muscle-gain",
    title: "Muscle Gain",
    description: "Fuel your workouts and recovery with protein-rich meals for muscle growth.",
    calories: "2200-2500 calories per day",
    price: "Starting from 180 MAD/week",
    features: [
      "High protein content",
      "Complex carbohydrates",
      "Performance-focused nutrition",
      "Recovery-enhancing ingredients",
    ],
    image: "/hearty-muscle-meal.png",
    color: "purple",
  },
  {
    id: "keto",
    title: "Keto",
    description: "Low-carb, high-fat meals designed to help your body reach and maintain ketosis.",
    calories: "1700-1900 calories per day",
    price: "Starting from 170 MAD/week",
    features: [
      "Low carb, high fat",
      "Moderate protein",
      "Ketogenic-friendly ingredients",
      "Satisfying fat-adapted meals",
    ],
    image: "/colorful-keto-plate.png",
    color: "orange",
  },
]

export default function MealPlansPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Meal Plans Tailored to Your Goals</h1>
        <p className="text-lg text-gray-600">
          Our chef-prepared meals are designed to help you reach your health and fitness goals with delicious,
          nutritionally balanced options for every lifestyle.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {mealPlans.map((plan) => (
          <Card
            key={plan.id}
            className="overflow-hidden border-t-4"
            style={{
              borderTopColor:
                plan.color === "green"
                  ? "#22c55e"
                  : plan.color === "blue"
                    ? "#3b82f6"
                    : plan.color === "purple"
                      ? "#8b5cf6"
                      : "#f97316",
            }}
          >
            <CardHeader className="pb-0">
              <div className="relative h-48 -mx-6 -mt-6 mb-4 overflow-hidden">
                <Image
                  src={plan.image || "/placeholder.svg"}
                  alt={plan.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <CardTitle className="text-2xl">{plan.title}</CardTitle>
              <CardDescription className="text-base mt-2">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-500">Calorie Range</span>
                <p className="font-semibold">{plan.calories}</p>
              </div>
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-500">Price</span>
                <p className="font-semibold">{plan.price}</p>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium text-gray-500">Key Features</span>
                <ul className="space-y-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Link href={`/meal-plans/${plan.id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    Learn More
                  </Button>
                </Link>
                <Link href={`/order?plan=${plan.id}`} className="flex-1">
                  <Button className="w-full bg-fitnest-green hover:bg-fitnest-green/90">Order Now</Button>
                </Link>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="bg-gray-50 rounded-xl p-8 md:p-12 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Not sure which plan is right for you?</h2>
            <p className="text-gray-600 mb-6">
              Take our quick quiz to get personalized recommendations based on your lifestyle, goals, and preferences.
            </p>
            <Link href="/meal-quiz">
              <Button className="bg-fitnest-green hover:bg-fitnest-green/90">
                Take the Quiz <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold mb-4">All plans include:</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                <span>Fresh, chef-prepared meals delivered to your door</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                <span>Flexible delivery schedule to fit your lifestyle</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                <span>No commitment - pause or cancel anytime</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                <span>Nutritional information for every meal</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                <span>Rotating menu to keep meals exciting</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to start your healthy eating journey?</h2>
        <p className="text-gray-600 mb-6">
          Choose your plan, customize your meals, and enjoy delicious, nutritious food delivered fresh to your door.
        </p>
        <Link href="/order">
          <Button size="lg" className="bg-fitnest-green hover:bg-fitnest-green/90">
            Order Your Meals Now
          </Button>
        </Link>
      </div>
    </div>
  )
}
