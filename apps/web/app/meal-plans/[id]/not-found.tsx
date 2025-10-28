import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function MealPlanNotFound() {
  return (
    <div className="container mx-auto px-4 py-16 md:px-6 text-center">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">Meal Plan Not Found</h1>
      <p className="text-lg text-gray-600 mb-8">Sorry, we couldn't find the meal plan you're looking for.</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/meal-plans">
          <Button className="bg-green-600 hover:bg-green-700">View All Meal Plans</Button>
        </Link>
        <Link href="/">
          <Button variant="outline">Return to Home</Button>
        </Link>
      </div>
    </div>
  )
}
