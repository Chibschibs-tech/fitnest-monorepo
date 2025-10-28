import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Star, Users, Clock, Truck, ChefHat, Heart, Shield, Leaf, Award } from "lucide-react"

export default function WaitlistPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-600 via-green-700 to-green-800">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-8">
              <div className="space-y-4">
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                  🎉 Launching Soon in Morocco
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  Your Healthy Meals,
                  <span className="text-green-200"> Delivered Fresh</span>
                </h1>
                <p className="text-xl text-green-100 leading-relaxed">
                  Join thousands of Moroccans who are transforming their health with our chef-prepared, nutritionally
                  balanced meals delivered right to your door.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-green-200" />
                  <span>Chef-Prepared</span>
                </div>
                <div className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-green-200" />
                  <span>Fresh Ingredients</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-green-200" />
                  <span>Free Delivery</span>
                </div>
              </div>

              {/* Waitlist Form */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <form className="space-y-4">
                    <div className="space-y-3">
                      <Input
                        placeholder="Your full name"
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30"
                      />
                      <Input
                        type="email"
                        placeholder="Your email address"
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30"
                      />
                      <Input
                        type="tel"
                        placeholder="Your phone number"
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30"
                      />
                    </div>
                    <Button className="w-full bg-white text-green-700 hover:bg-green-50 font-semibold py-3">
                      Join the Waitlist - Get 20% Off
                    </Button>
                    <p className="text-xs text-green-100 text-center">
                      Be the first to know when we launch in your city
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="relative">
              <div className="relative z-10">
                <Image
                  src="/hero-banner-full.png"
                  alt="Healthy meal delivery"
                  width={600}
                  height={400}
                  className="rounded-2xl shadow-2xl"
                  priority
                />
              </div>
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-green-400/30 rounded-full blur-3xl" />
              <div className="absolute -bottom-8 -left-8 w-96 h-96 bg-green-300/20 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-center">
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-green-600" />
              <span className="text-lg font-semibold">12,000+ People Waiting</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-6 w-6 text-yellow-500 fill-current" />
              <span className="text-lg font-semibold">4.9/5 Rating Expected</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-semibold">Launching Q2 2024</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">How Fitnest Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple, convenient, and designed for your busy lifestyle
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-green-600">1</span>
                </div>
                <h3 className="text-xl font-semibold">Choose Your Plan</h3>
                <p className="text-gray-600">
                  Select from our weight loss, muscle building, or keto meal plans tailored to your goals
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-green-600">2</span>
                </div>
                <h3 className="text-xl font-semibold">We Prepare & Cook</h3>
                <p className="text-gray-600">
                  Our chefs prepare your meals with fresh, local ingredients and precise nutritional balance
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-green-600">3</span>
                </div>
                <h3 className="text-xl font-semibold">Delivered Fresh</h3>
                <p className="text-gray-600">
                  Receive your meals delivered fresh to your door, ready to heat and enjoy
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Meal Plans Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Our Meal Plans</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Scientifically designed meal plans to help you achieve your health goals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative h-48">
                <Image src="/vibrant-weight-loss-meal.png" alt="Weight Loss Plan" fill className="object-cover" />
                <Badge className="absolute top-4 left-4 bg-red-500">Most Popular</Badge>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">Weight Loss Plan</h3>
                <p className="text-gray-600 mb-4">
                  Balanced, portion-controlled meals designed to help you lose weight safely and sustainably.
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex justify-between">
                    <span>Calories:</span>
                    <span>1,200-1,500/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Protein:</span>
                    <span>High</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Starting at:</span>
                    <span className="font-semibold text-green-600">299 MAD/week</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative h-48">
                <Image src="/hearty-muscle-meal.png" alt="Muscle Building Plan" fill className="object-cover" />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">Muscle Building Plan</h3>
                <p className="text-gray-600 mb-4">
                  High-protein meals to support muscle growth and recovery for active individuals.
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex justify-between">
                    <span>Calories:</span>
                    <span>2,000-2,500/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Protein:</span>
                    <span>Very High</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Starting at:</span>
                    <span className="font-semibold text-green-600">399 MAD/week</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative h-48">
                <Image src="/colorful-keto-plate.png" alt="Keto Plan" fill className="object-cover" />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">Keto Plan</h3>
                <p className="text-gray-600 mb-4">
                  Low-carb, high-fat meals following ketogenic principles for fat burning.
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex justify-between">
                    <span>Calories:</span>
                    <span>1,500-1,800/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Carbs:</span>
                    <span>Very Low</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Starting at:</span>
                    <span className="font-semibold text-green-600">349 MAD/week</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">What Our Beta Users Say</h2>
            <p className="text-xl text-gray-600">Real feedback from our pilot program in Casablanca</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6">
              <CardContent className="space-y-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600">
                  "I lost 8kg in 2 months with Fitnest! The meals are delicious and I never felt like I was on a diet."
                </p>
                <div className="flex items-center gap-3">
                  <Image
                    src="/diverse-group-city.png"
                    alt="Testimonial"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <div className="font-semibold">Aicha M.</div>
                    <div className="text-sm text-gray-500">Casablanca</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="space-y-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600">
                  "As a busy professional, Fitnest saves me hours every week. The quality is restaurant-level!"
                </p>
                <div className="flex items-center gap-3">
                  <Image
                    src="/contemplative-man.png"
                    alt="Testimonial"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <div className="font-semibold">Youssef K.</div>
                    <div className="text-sm text-gray-500">Rabat</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="space-y-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600">
                  "The keto plan helped me reach my fitness goals faster than I ever imagined. Highly recommended!"
                </p>
                <div className="flex items-center gap-3">
                  <Image
                    src="/contemplative-artist.png"
                    alt="Testimonial"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <div className="font-semibold">Fatima Z.</div>
                    <div className="text-sm text-gray-500">Marrakech</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Why Choose Fitnest?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're committed to delivering the best meal experience in Morocco
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Heart className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold">Made with Love</h3>
              <p className="text-gray-600 text-sm">
                Every meal is prepared with care by our passionate chefs using traditional Moroccan cooking techniques
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold">Food Safety First</h3>
              <p className="text-gray-600 text-sm">
                HACCP certified kitchen with the highest food safety standards and temperature-controlled delivery
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Leaf className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold">Local & Fresh</h3>
              <p className="text-gray-600 text-sm">
                We source ingredients from local Moroccan farms to ensure freshness and support our community
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Award className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold">Nutritionist Approved</h3>
              <p className="text-gray-600 text-sm">
                All meals are designed by certified nutritionists to ensure optimal macro and micronutrient balance
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Everything you need to know about Fitnest</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">When will Fitnest be available?</h3>
                <p className="text-gray-600">
                  We're launching in Q2 2024, starting with Casablanca and Rabat. Join our waitlist to be notified when
                  we're available in your city.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">How much do meal plans cost?</h3>
                <p className="text-gray-600">
                  Our plans start from 299 MAD per week. Waitlist members get 20% off their first month when we launch.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">Can I customize my meals?</h3>
                <p className="text-gray-600">
                  Yes! You can specify dietary restrictions, allergies, and food preferences. Our chefs will customize
                  your meals accordingly.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">How often do you deliver?</h3>
                <p className="text-gray-600">
                  We deliver fresh meals 2-3 times per week to ensure maximum freshness. You can choose your preferred
                  delivery days and times.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">What if I don't like a meal?</h3>
                <p className="text-gray-600">
                  We offer a 100% satisfaction guarantee. If you're not happy with any meal, we'll replace it or provide
                  a full refund.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-green-700">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-8 text-white">
            <h2 className="text-3xl lg:text-4xl font-bold">Ready to Transform Your Health?</h2>
            <p className="text-xl text-green-100">
              Join 12,000+ Moroccans who are already on the waitlist for the future of healthy eating.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-green-700 hover:bg-green-50 px-8 py-4 text-lg font-semibold">
                Join the Waitlist Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-green-700 px-8 py-4 text-lg bg-transparent"
              >
                Learn More
              </Button>
            </div>
            <p className="text-sm text-green-200">
              No spam, ever. Unsubscribe at any time. Early access guaranteed for waitlist members.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
