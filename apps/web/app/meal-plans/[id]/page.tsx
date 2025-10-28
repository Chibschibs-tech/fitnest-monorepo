import { notFound } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Users, Utensils } from "lucide-react"

const mealPlans = {
  "weight-loss": {
    id: "weight-loss",
    name: "Weight Loss Plan",
    description: "Calorie-controlled meals designed to help you lose weight while staying satisfied.",
    longDescription:
      "Our Weight Loss Plan is scientifically designed to create a sustainable caloric deficit while ensuring you get all the nutrients your body needs. Each meal is portion-controlled and packed with lean proteins, fiber-rich vegetables, and complex carbohydrates to keep you feeling full and energized throughout your weight loss journey.",
    price: 350,
    originalPrice: 420,
    duration: "week",
    calories: "1200-1500",
    protein: "25-30g per meal",
    image: "/weight-loss-meal.png",
    heroImage: "/vibrant-weight-loss-meal.png",
    features: [
      "Portion-controlled meals",
      "High protein content",
      "Low calorie density",
      "Fiber-rich vegetables",
      "Sustainable weight loss",
      "Nutritionist approved",
    ],
    benefits: [
      "Lose 1-2 lbs per week safely",
      "Maintain muscle mass",
      "Boost metabolism",
      "Reduce cravings",
      "Improve energy levels",
    ],
    sampleMeals: [
      {
        name: "Grilled Chicken & Quinoa Bowl",
        description: "Lean chicken breast with quinoa, roasted vegetables, and tahini dressing",
        calories: 420,
        image: "/grilled-chicken-vegetable-medley.png",
      },
      {
        name: "Mediterranean Salmon",
        description: "Herb-crusted salmon with Greek salad and lemon vinaigrette",
        calories: 380,
        image: "/pan-seared-salmon-quinoa.png",
      },
      {
        name: "Turkey & Veggie Wrap",
        description: "Whole wheat wrap with lean turkey, fresh vegetables, and hummus",
        calories: 350,
        image: "/fresh-tuna-avocado-wrap.png",
      },
    ],
  },
  "muscle-gain": {
    id: "muscle-gain",
    name: "Muscle Gain Plan",
    description: "Protein-rich meals to support muscle growth and recovery after workouts.",
    longDescription:
      "Fuel your muscle-building goals with our high-protein Muscle Gain Plan. Each meal is carefully crafted to provide optimal protein timing and amino acid profiles to support muscle protein synthesis. Combined with complex carbohydrates for energy and healthy fats for hormone production.",
    price: 400,
    originalPrice: 480,
    duration: "week",
    calories: "2000-2500",
    protein: "35-45g per meal",
    image: "/muscle-gain-meal.png",
    heroImage: "/hearty-muscle-meal.png",
    features: [
      "High protein content",
      "Post-workout nutrition",
      "Lean muscle support",
      "Complex carbohydrates",
      "Optimal amino acids",
      "Performance focused",
    ],
    benefits: [
      "Build lean muscle mass",
      "Faster recovery",
      "Increased strength",
      "Better workout performance",
      "Enhanced metabolism",
    ],
    sampleMeals: [
      {
        name: "Ribeye Steak & Sweet Potato",
        description: "Grilled ribeye with roasted sweet potato and steamed broccoli",
        calories: 650,
        image: "/muscle-gain-meal.png",
      },
      {
        name: "Protein Power Bowl",
        description: "Chicken, quinoa, black beans, and avocado with cilantro lime dressing",
        calories: 580,
        image: "/chicken-quinoa-power-bowl.png",
      },
      {
        name: "Turkey Meatballs & Rice",
        description: "Lean turkey meatballs with brown rice and mixed vegetables",
        calories: 520,
        image: "/savory-turkey-meatballs.png",
      },
    ],
  },
  keto: {
    id: "keto",
    name: "Keto Plan",
    description: "Low-carb, high-fat meals designed to help you achieve and maintain ketosis.",
    longDescription:
      "Enter and maintain ketosis with our expertly crafted Keto Plan. Each meal contains less than 20g of net carbs while providing healthy fats and moderate protein to keep you in the fat-burning state. Perfect for those following a ketogenic lifestyle.",
    price: 380,
    originalPrice: 450,
    duration: "week",
    calories: "1600-2000",
    protein: "25-35g per meal",
    image: "/keto-meal.png",
    heroImage: "/colorful-keto-plate.png",
    features: [
      "Under 20g net carbs",
      "High healthy fats",
      "Ketosis support",
      "MCT oil included",
      "Electrolyte balance",
      "Keto-friendly ingredients",
    ],
    benefits: ["Rapid fat loss", "Mental clarity", "Stable energy", "Reduced appetite", "Better sleep quality"],
    sampleMeals: [
      {
        name: "Salmon & Avocado Salad",
        description: "Grilled salmon with avocado, leafy greens, and olive oil dressing",
        calories: 480,
        image: "/keto-meal.png",
      },
      {
        name: "Beef & Cauliflower Mash",
        description: "Grass-fed beef with cauliflower mash and sautéed spinach",
        calories: 520,
        image: "/classic-beef-broccoli.png",
      },
      {
        name: "Egg & Cheese Omelette",
        description: "Three-egg omelette with cheese, mushrooms, and herbs",
        calories: 420,
        image: "/fluffy-egg-white-omelette.png",
      },
    ],
  },
  "stay-fit": {
    id: "stay-fit",
    name: "Stay Fit Plan",
    description: "Balanced nutrition to maintain your weight and support an active lifestyle.",
    longDescription:
      "Maintain your ideal weight and support your active lifestyle with our balanced Stay Fit Plan. Each meal provides the perfect balance of macronutrients to fuel your workouts, support recovery, and maintain your current physique.",
    price: 320,
    originalPrice: 380,
    duration: "week",
    calories: "1800-2200",
    protein: "30-35g per meal",
    image: "/vibrant-nutrition-plate.png",
    heroImage: "/vibrant-meal-prep.png",
    features: [
      "Balanced macronutrients",
      "Maintenance calories",
      "Active lifestyle support",
      "Variety of cuisines",
      "Flexible portions",
      "Sustainable nutrition",
    ],
    benefits: [
      "Maintain current weight",
      "Support active lifestyle",
      "Consistent energy",
      "Nutritional balance",
      "Convenient meal prep",
    ],
    sampleMeals: [
      {
        name: "Chicken & Quinoa Bowl",
        description: "Grilled chicken with quinoa, roasted vegetables, and tahini sauce",
        calories: 520,
        image: "/chicken-quinoa-power-bowl.png",
      },
      {
        name: "Vegetable Stir Fry",
        description: "Mixed vegetables with tofu in a savory Asian-inspired sauce",
        calories: 450,
        image: "/vibrant-vegetable-stir-fry.png",
      },
      {
        name: "Protein Pancakes",
        description: "High-protein pancakes with berries and sugar-free syrup",
        calories: 380,
        image: "/fluffy-protein-stack.png",
      },
    ],
  },
}

export default function MealPlanPage({ params }: { params: { id: string } }) {
  // Handle both numeric IDs and string slugs
  const plan = mealPlans[params.id as keyof typeof mealPlans]

  if (!plan) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-fitnest-green to-green-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <Badge className="mb-4 bg-white/20 text-white border-white/30">{plan.calories} calories per day</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{plan.name}</h1>
              <p className="text-xl mb-6 text-green-100">{plan.description}</p>
              <div className="flex items-center gap-4 mb-8">
                <div className="text-3xl font-bold">
                  {plan.price} MAD/{plan.duration}
                </div>
                {plan.originalPrice && (
                  <div className="text-lg line-through text-green-200">{plan.originalPrice} MAD</div>
                )}
              </div>
              <Button size="lg" className="bg-fitnest-orange hover:bg-orange-600 text-white">
                Start Your Plan
              </Button>
            </div>
            <div className="relative">
              <Image
                src={plan.heroImage || "/placeholder.svg"}
                alt={plan.name}
                width={500}
                height={400}
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Plan Details */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About This Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-fitnest-green">About This Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">{plan.longDescription}</p>
              </CardContent>
            </Card>

            {/* Sample Meals */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-fitnest-green">Sample Meals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {plan.sampleMeals.map((meal, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <Image
                        src={meal.image || "/placeholder.svg"}
                        alt={meal.name}
                        width={200}
                        height={150}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                      <h4 className="font-semibold text-gray-900 mb-2">{meal.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{meal.description}</p>
                      <div className="text-sm font-medium text-fitnest-green">{meal.calories} calories</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-fitnest-green">Plan Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {plan.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-fitnest-green flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Plan Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-fitnest-green">Plan Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-fitnest-green flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-fitnest-green">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Utensils className="h-5 w-5 text-fitnest-orange" />
                  <div>
                    <div className="font-medium">Daily Calories</div>
                    <div className="text-sm text-gray-600">{plan.calories}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-fitnest-orange" />
                  <div>
                    <div className="font-medium">Protein per Meal</div>
                    <div className="text-sm text-gray-600">{plan.protein}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-fitnest-orange" />
                  <div>
                    <div className="font-medium">Delivery</div>
                    <div className="text-sm text-gray-600">Fresh daily</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <Card className="bg-fitnest-green text-white">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold mb-2">Ready to Start?</h3>
                <p className="text-green-100 mb-4">Join thousands of satisfied customers</p>
                <Button className="w-full bg-fitnest-orange hover:bg-orange-600">
                  Order Now - {plan.price} MAD/week
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
