import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section - Full banner image with mobile optimization */}
      <section className="relative min-h-[50vh] sm:min-h-[60vh] md:min-h-[calc(100vh-73px)] flex items-end bg-gray-100">
        <Image
          src="https://obtmksfewry4ishp.public.blob.vercel-storage.com/hero%20banner"
          alt="Fitnest.ma Hero Banner"
          fill
          className="object-cover object-center"
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
        />
        <div className="relative z-10 container mx-auto px-4 pb-8 sm:pb-12 md:pb-16">
          <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-0 sm:flex-row sm:space-x-4">
            <Link href="/meal-plans">
              <Button className="bg-fitnest-orange text-white hover:bg-fitnest-orange/90 w-full sm:w-auto text-sm sm:text-base px-6 py-2 sm:px-8 sm:py-3">
                View Meal Plans
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button className="bg-white text-fitnest-green hover:bg-white/90 w-full sm:w-auto text-sm sm:text-base px-6 py-2 sm:px-8 sm:py-3">
                How It Works
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Meal Plans Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="mb-2 text-center text-3xl font-bold">Our Meal Plans</h2>
          <p className="mb-12 text-center text-gray-600 max-w-2xl mx-auto">
            Choose from our selection of chef-prepared meal plans designed to meet your specific health and fitness
            goals.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Weight Loss Plan */}
            <div className="bg-white rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105">
              <div className="relative h-48">
                <Image src="/weight-loss-meal.png" alt="Weight Loss Meal Plan" fill className="object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Weight Loss Plan</h3>
                <p className="text-gray-600 mb-4">
                  Calorie-controlled meals designed to help you lose weight while staying satisfied.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-fitnest-green font-bold">From 350 MAD/week</span>
                  <Link href="/meal-plans/weight-loss">
                    <Button size="sm" className="bg-fitnest-green hover:bg-fitnest-green/90 text-white">
                      View Plan
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Stay Fit Plan */}
            <div className="bg-white rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105">
              <div className="relative h-48">
                <Image src="/vibrant-nutrition-plate.png" alt="Stay Fit Meal Plan" fill className="object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Stay Fit Plan</h3>
                <p className="text-gray-600 mb-4">
                  Balanced nutrition to maintain your weight and support an active lifestyle.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-fitnest-green font-bold">From 320 MAD/week</span>
                  <Link href="/meal-plans/balanced-nutrition">
                    <Button size="sm" className="bg-fitnest-green hover:bg-fitnest-green/90 text-white">
                      View Plan
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Muscle Gain Plan */}
            <div className="bg-white rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105">
              <div className="relative h-48">
                <Image src="/muscle-gain-meal.png" alt="Muscle Gain Meal Plan" fill className="object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Muscle Gain Plan</h3>
                <p className="text-gray-600 mb-4">
                  Protein-rich meals to support muscle growth and recovery after workouts.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-fitnest-green font-bold">From 400 MAD/week</span>
                  <Link href="/meal-plans/muscle-gain">
                    <Button size="sm" className="bg-fitnest-green hover:bg-fitnest-green/90 text-white">
                      View Plan
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Keto Plan */}
            <div className="bg-white rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105">
              <div className="relative h-48">
                <Image src="/keto-meal.png" alt="Keto Meal Plan" fill className="object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Keto Plan</h3>
                <p className="text-gray-600 mb-4">
                  Low-carb, high-fat meals designed to help you achieve and maintain ketosis.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-fitnest-green font-bold">From 380 MAD/week</span>
                  <Link href="/meal-plans/keto">
                    <Button size="sm" className="bg-fitnest-green hover:bg-fitnest-green/90 text-white">
                      View Plan
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link href="/meal-plans">
              <Button
                variant="outline"
                className="border-fitnest-green text-fitnest-green hover:bg-fitnest-green hover:text-white"
              >
                View All Meal Plans
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">Why Choose Fitnest</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:grid-cols-3">
            <div className="rounded-lg p-6 text-center shadow-lg bg-gray-50">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-fitnest-green/10 text-fitnest-green">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Health First</h3>
              <p className="text-gray-600">
                Every meal is designed to fuel your body and promote long-term well-being.
              </p>
            </div>
            <div className="rounded-lg p-6 text-center shadow-lg bg-gray-50">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-fitnest-orange/10 text-fitnest-orange">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Simplicity & Convenience</h3>
              <p className="text-gray-600">
                We remove barriers to healthy habits with personalized meals delivered to your door.
              </p>
            </div>
            <div className="rounded-lg p-6 text-center shadow-lg bg-gray-50">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-fitnest-green/10 text-fitnest-green">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Lifestyle Transformation</h3>
              <p className="text-gray-600">
                We support your entire wellness journey through balanced nutrition, education, and guidance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section - Improved mobile horizontal scrolling */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="mb-2 text-center text-3xl font-bold">Latest from Our Blog</h2>
          <p className="mb-8 text-center text-gray-600 max-w-2xl mx-auto">
            Expert advice on nutrition, fitness, and healthy living to help you achieve your wellness goals.
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
                        Meal Prep
                      </span>
                      <span className="text-xs text-gray-500">5 min</span>
                    </div>
                    <h3 className="text-lg font-bold mb-2 line-clamp-2">
                      10 Healthy Meal Prep Tips for Busy Professionals
                    </h3>
                    <Link
                      href="/blog/healthy-meal-prep"
                      className="text-fitnest-orange font-medium text-sm flex items-center"
                    >
                      Read More <ChevronRight className="h-4 w-4 ml-1" />
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
                        Nutrition
                      </span>
                      <span className="text-xs text-gray-500">7 min</span>
                    </div>
                    <h3 className="text-lg font-bold mb-2 line-clamp-2">5 Common Nutrition Myths Debunked</h3>
                    <Link
                      href="/blog/nutrition-myths"
                      className="text-fitnest-orange font-medium text-sm flex items-center"
                    >
                      Read More <ChevronRight className="h-4 w-4 ml-1" />
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
                        Fitness
                      </span>
                      <span className="text-xs text-gray-500">8 min</span>
                    </div>
                    <h3 className="text-lg font-bold mb-2 line-clamp-2">Breaking Through a Weight Loss Plateau</h3>
                    <Link
                      href="/blog/weight-loss-plateau"
                      className="text-fitnest-orange font-medium text-sm flex items-center"
                    >
                      Read More <ChevronRight className="h-4 w-4 ml-1" />
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
                    Meal Prep
                  </span>
                  <span className="text-xs text-gray-500">5 min read</span>
                </div>
                <h3 className="text-xl font-bold mb-2">10 Healthy Meal Prep Tips for Busy Professionals</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  Learn how to efficiently prepare nutritious meals for the entire week, even with a busy schedule.
                </p>
                <Link href="/blog/healthy-meal-prep">
                  <Button
                    variant="outline"
                    className="w-full border-fitnest-orange text-fitnest-orange hover:bg-fitnest-orange hover:text-white"
                  >
                    Read More
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
                    Nutrition
                  </span>
                  <span className="text-xs text-gray-500">7 min read</span>
                </div>
                <h3 className="text-xl font-bold mb-2">5 Common Nutrition Myths Debunked</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  Separating fact from fiction: nutrition experts weigh in on popular diet claims and misconceptions.
                </p>
                <Link href="/blog/nutrition-myths">
                  <Button
                    variant="outline"
                    className="w-full border-fitnest-orange text-fitnest-orange hover:bg-fitnest-orange hover:text-white"
                  >
                    Read More
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
                    Fitness
                  </span>
                  <span className="text-xs text-gray-500">8 min read</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Breaking Through a Weight Loss Plateau</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  Effective strategies to overcome stalled progress and continue your weight loss journey.
                </p>
                <Link href="/blog/weight-loss-plateau">
                  <Button
                    variant="outline"
                    className="w-full border-fitnest-orange text-fitnest-orange hover:bg-fitnest-orange hover:text-white"
                  >
                    Read More
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link href="/blog">
              <Button className="bg-fitnest-orange text-white hover:bg-fitnest-orange/90">View All Articles</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Express Shop Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="mb-2 text-center text-3xl font-bold">Express Shop</h2>
          <p className="mb-12 text-center text-gray-600 max-w-2xl mx-auto">
            Discover our selection of healthy snacks and supplements to complement your meal plans and keep you
            energized throughout the day.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Protein Bar */}
            <div className="bg-white rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105">
              <div className="relative h-48">
                <Image src="/protein-bar.png" alt="Protein Power Bar" fill className="object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Protein Power Bars</h3>
                <p className="text-gray-600 mb-4">
                  High-protein bars perfect for post-workout recovery or a quick energy boost.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-fitnest-green font-bold">From 25 MAD</span>
                  <Link href="/express-shop?category=protein_bars">
                    <Button size="sm" className="bg-fitnest-green hover:bg-fitnest-green/90 text-white">
                      Shop Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Granola */}
            <div className="bg-white rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105">
              <div className="relative h-48">
                <Image src="/honey-almond-granola.png" alt="Honey Almond Granola" fill className="object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Premium Granola</h3>
                <p className="text-gray-600 mb-4">
                  Crunchy granola with premium ingredients, perfect for breakfast or snacking.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-fitnest-green font-bold">From 32 MAD</span>
                  <Link href="/express-shop?category=granola">
                    <Button size="sm" className="bg-fitnest-green hover:bg-fitnest-green/90 text-white">
                      Shop Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Energy Balls */}
            <div className="bg-white rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105">
              <div className="relative h-48">
                <Image src="/placeholder.svg?height=192&width=256" alt="Energy Balls" fill className="object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Energy Balls</h3>
                <p className="text-gray-600 mb-4">
                  Natural energy balls made with dates, nuts, and superfoods for sustained energy.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-fitnest-green font-bold">From 40 MAD</span>
                  <Link href="/express-shop?category=energy_balls">
                    <Button size="sm" className="bg-fitnest-green hover:bg-fitnest-green/90 text-white">
                      Shop Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Breakfast Mixes */}
            <div className="bg-white rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105">
              <div className="relative h-48">
                <Image src="/healthy-protein-pancake-mix.png" alt="Breakfast Mixes" fill className="object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Breakfast Mixes</h3>
                <p className="text-gray-600 mb-4">
                  Quick and nutritious breakfast options including protein pancakes and overnight oats.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-fitnest-green font-bold">From 50 MAD</span>
                  <Link href="/express-shop?category=breakfast">
                    <Button size="sm" className="bg-fitnest-green hover:bg-fitnest-green/90 text-white">
                      Shop Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link href="/express-shop">
              <Button className="bg-fitnest-orange text-white hover:bg-fitnest-orange/90">Visit Express Shop</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-fitnest-green py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 text-3xl font-bold">Ready to Transform Your Lifestyle?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg">
            Join us in our mission to make healthy eating simple, enjoyable, and part of everyday life. Take the first
            step toward a healthier you today.
          </p>
          <Link href="/order">
            <Button className="bg-fitnest-orange text-white hover:bg-fitnest-orange/90">Get Started Today</Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
