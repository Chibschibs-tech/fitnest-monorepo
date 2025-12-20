"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Star, Users, Calendar, ChefHat, Truck, Leaf, Heart, Shield, Award, CheckCircle2, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function WaitlistPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    mealPlan: "",
    city: "",
    notifications: false,
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email) {
        setError("Please fill in all required fields")
        setLoading(false)
        return
      }

      // Submit to both endpoints
      const [dbResponse, emailResponse] = await Promise.allSettled([
        fetch("/api/waitlist-simple", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }),
        fetch("/api/waitlist-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }),
      ])

      // Check responses
      if (dbResponse.status === "rejected" || emailResponse.status === "rejected") {
        console.error("Submission error:", { dbResponse, emailResponse })
      }

      const dbResult = dbResponse.status === "fulfilled" ? await dbResponse.value.json() : null
      const emailResult = emailResponse.status === "fulfilled" ? await emailResponse.value.json() : null

      if (dbResult?.success || emailResult?.success) {
        setSuccess(true)
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          mealPlan: "",
          city: "",
          notifications: false,
        })
        // Redirect to success page after 2 seconds
        setTimeout(() => {
          window.location.href = "/waitlist/success"
        }, 2000)
      } else {
        setError("Something went wrong. Please try again.")
      }
    } catch (err: any) {
      console.error("Waitlist submission error:", err)
      setError(err.message || "Failed to submit. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-fitnest-green via-fitnest-green/90 to-fitnest-green/80" style={{ marginTop: 0 }}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative container mx-auto px-4 pt-24 pb-16 lg:pt-32 lg:pb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-6">
              <div className="space-y-4">
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 rounded-full px-4 py-1">
                  🎉 Official Launch 21/12/25
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  Your Healthy Meals,
                  <span className="text-fitnest-orange"> Delivered Fresh</span>
                </h1>
                <p className="text-xl text-white/90 leading-relaxed">
                  Join the Fitnest community and transform your health with chef-prepared, nutritionally balanced meals
                  delivered right to your door in Morocco.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-fitnest-orange" />
                  <span>Chef-Prepared</span>
                </div>
                <div className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-fitnest-orange" />
                  <span>Fresh Ingredients</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-fitnest-orange" />
                  <span>Free Delivery</span>
                </div>
              </div>

              {/* Waitlist Form */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-lg">
                <CardContent className="p-6">
                  {success ? (
                    <div className="text-center space-y-4">
                      <CheckCircle2 className="h-12 w-12 text-fitnest-orange mx-auto" />
                      <h3 className="text-xl font-bold text-white">You're on the list!</h3>
                      <p className="text-white/90">Redirecting to confirmation page...</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {error && (
                        <Alert variant="destructive" className="bg-red-50 border-red-200">
                          <AlertDescription className="text-red-800">{error}</AlertDescription>
                        </Alert>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-white/90 text-sm">
                            First Name *
                          </Label>
                          <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            placeholder="First name"
                            className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 rounded-full"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-white/90 text-sm">
                            Last Name *
                          </Label>
                          <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            placeholder="Last name"
                            className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 rounded-full"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-white/90 text-sm">
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="your.email@example.com"
                          className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 rounded-full"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-white/90 text-sm">
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+212 6XX XXX XXX"
                          className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 rounded-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mealPlan" className="text-white/90 text-sm">
                          Preferred Meal Plan
                        </Label>
                        <Select value={formData.mealPlan} onValueChange={(value) => setFormData({ ...formData, mealPlan: value })}>
                          <SelectTrigger className="bg-white/20 border-white/30 text-white rounded-full">
                            <SelectValue placeholder="Select a plan" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low-cal">Low Cal</SelectItem>
                            <SelectItem value="balanced">Balanced</SelectItem>
                            <SelectItem value="muscle-gain">Muscle Gain</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-white/90 text-sm">
                          City
                        </Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="Casablanca, Rabat, etc."
                          className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 rounded-full"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="notifications"
                          checked={formData.notifications}
                          onCheckedChange={(checked) => setFormData({ ...formData, notifications: checked === true })}
                          className="border-white/30 data-[state=checked]:bg-fitnest-orange data-[state=checked]:border-fitnest-orange"
                        />
                        <Label htmlFor="notifications" className="text-white/90 text-sm cursor-pointer">
                          I want to receive updates and special offers
                        </Label>
                      </div>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-fitnest-orange text-white hover:bg-fitnest-orange/90 rounded-full py-6 text-lg font-semibold"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          "Join the Waitlist - Get 20% Off"
                        )}
                      </Button>
                      <p className="text-xs text-white/80 text-center">
                        Be the first to know when we launch. No spam, unsubscribe anytime.
                      </p>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="relative">
              <div className="relative z-10">
                <Image
                  src="https://obtmksfewry4ishp.public.blob.vercel-storage.com/hero%20banner"
                  alt="Healthy meal delivery service in Morocco"
                  width={600}
                  height={400}
                  className="rounded-3xl shadow-2xl object-cover w-full h-auto"
                  priority
                />
              </div>
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-fitnest-orange/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-8 -left-8 w-96 h-96 bg-fitnest-green/20 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-center">
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-fitnest-green" />
              <span className="text-lg font-semibold text-gray-900">46 people in the waitlist</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-6 w-6 text-fitnest-orange fill-current" />
              <span className="text-lg font-semibold text-gray-900">4.9/5 Rating Expected</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-fitnest-green" />
              <span className="text-lg font-semibold text-gray-900">Official launch 21/12/25</span>
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
            <Card className="text-center p-8 hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-fitnest-green/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-fitnest-green">1</span>
                </div>
                <h3 className="text-xl font-semibold">Choose Your Plan</h3>
                <p className="text-gray-600">
                  Select from our Low Cal, Balanced, or Muscle Gain meal plans tailored to your goals
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-fitnest-green/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-fitnest-green">2</span>
                </div>
                <h3 className="text-xl font-semibold">We Prepare & Cook</h3>
                <p className="text-gray-600">
                  Our chefs prepare your meals with fresh, local ingredients and precise nutritional balance
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-fitnest-green/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-fitnest-green">3</span>
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
            <Card className="overflow-hidden hover:shadow-xl transition-shadow border-0 shadow-md">
              <div className="relative h-48 bg-gradient-to-br from-fitnest-green/20 to-fitnest-green/10">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Leaf className="h-24 w-24 text-fitnest-green/30" />
                </div>
                <Badge className="absolute top-4 left-4 bg-fitnest-orange rounded-full">Most Popular</Badge>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">Low Cal</h3>
                <p className="text-gray-600 mb-4">
                  Balanced, portion-controlled meals designed to help you achieve your weight goals safely and
                  sustainably.
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
                    <span className="font-semibold text-fitnest-green">299 MAD/week</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-xl transition-shadow border-0 shadow-md">
              <div className="relative h-48 bg-gradient-to-br from-fitnest-orange/20 to-fitnest-orange/10">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Heart className="h-24 w-24 text-fitnest-orange/30" />
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">Balanced</h3>
                <p className="text-gray-600 mb-4">
                  Perfectly balanced nutrition to maintain your weight and support an active, healthy lifestyle.
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex justify-between">
                    <span>Calories:</span>
                    <span>1,800-2,200/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Macros:</span>
                    <span>Balanced</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Starting at:</span>
                    <span className="font-semibold text-fitnest-green">349 MAD/week</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-xl transition-shadow border-0 shadow-md">
              <div className="relative h-48 bg-gradient-to-br from-fitnest-green/30 to-fitnest-orange/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Award className="h-24 w-24 text-fitnest-green/30" />
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">Muscle Gain</h3>
                <p className="text-gray-600 mb-4">
                  High-protein meals to support muscle growth and recovery for active individuals and athletes.
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
                    <span className="font-semibold text-fitnest-green">399 MAD/week</span>
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
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">What Our Beta Testers Say</h2>
            <p className="text-xl text-gray-600">Real feedback from users who tested our meals</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 border-0 shadow-md">
              <CardContent className="space-y-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-fitnest-orange fill-current" />
                  ))}
                </div>
                <p className="text-gray-600">
                  "I tested the meals during the beta phase and they were absolutely delicious! The flavors are rich and
                  authentic. I've completely stopped wasting time trying to figure out my food routine."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-fitnest-green/20 rounded-full flex items-center justify-center">
                    <span className="text-fitnest-green font-semibold">AM</span>
                  </div>
                  <div>
                    <div className="font-semibold">Aicha M.</div>
                    <div className="text-sm text-gray-500">Casablanca</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 border-0 shadow-md">
              <CardContent className="space-y-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-fitnest-orange fill-current" />
                  ))}
                </div>
                <p className="text-gray-600">
                  "The experience was so satisfying! Every meal I tested was perfectly prepared and nutritious. I no
                  longer spend hours meal planning and grocery shopping. Fitnest has transformed my daily routine."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-fitnest-orange/20 rounded-full flex items-center justify-center">
                    <span className="text-fitnest-orange font-semibold">YK</span>
                  </div>
                  <div>
                    <div className="font-semibold">Youssef K.</div>
                    <div className="text-sm text-gray-500">Rabat</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 border-0 shadow-md">
              <CardContent className="space-y-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-fitnest-orange fill-current" />
                  ))}
                </div>
                <p className="text-gray-600">
                  "I was part of the beta testing program and the meals exceeded my expectations. Delicious, fresh, and
                  perfectly portioned. I've stopped wasting time on meal prep and can focus on what matters most."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-fitnest-green/20 rounded-full flex items-center justify-center">
                    <span className="text-fitnest-green font-semibold">FZ</span>
                  </div>
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
              <div className="w-16 h-16 bg-fitnest-green/10 rounded-full flex items-center justify-center mx-auto">
                <Heart className="h-8 w-8 text-fitnest-green" />
              </div>
              <h3 className="text-lg font-semibold">Made with Love</h3>
              <p className="text-gray-600 text-sm">
                Every meal is prepared with care by our passionate chefs using traditional Moroccan cooking techniques
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-fitnest-green/10 rounded-full flex items-center justify-center mx-auto">
                <Shield className="h-8 w-8 text-fitnest-green" />
              </div>
              <h3 className="text-lg font-semibold">Food Safety First</h3>
              <p className="text-gray-600 text-sm">
                HACCP certified kitchen with the highest food safety standards and temperature-controlled delivery
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-fitnest-green/10 rounded-full flex items-center justify-center mx-auto">
                <Leaf className="h-8 w-8 text-fitnest-green" />
              </div>
              <h3 className="text-lg font-semibold">Local & Fresh</h3>
              <p className="text-gray-600 text-sm">
                We source ingredients from local Moroccan farms to ensure freshness and support our community
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-fitnest-green/10 rounded-full flex items-center justify-center mx-auto">
                <Award className="h-8 w-8 text-fitnest-green" />
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
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">When will Fitnest be available?</h3>
                <p className="text-gray-600">
                  We're officially launching on December 21, 2025, starting with Casablanca and Rabat. Join our
                  waitlist to be notified when we're available in your city.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">How much do meal plans cost?</h3>
                <p className="text-gray-600">
                  Our plans start from 299 MAD per week. Waitlist members get 20% off their first month when we launch.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">Can I customize my meals?</h3>
                <p className="text-gray-600">
                  Yes! You can specify dietary restrictions, allergies, and food preferences. Our chefs will customize
                  your meals accordingly.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">How often do you deliver?</h3>
                <p className="text-gray-600">
                  We deliver fresh meals 2-3 times per week to ensure maximum freshness. You can choose your preferred
                  delivery days and times.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
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
      <section className="py-20 bg-gradient-to-r from-fitnest-green to-fitnest-green/90">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-8 text-white">
            <h2 className="text-3xl lg:text-4xl font-bold">Ready to Transform Your Health?</h2>
            <p className="text-xl text-white/90">
              Join 46 people who are already on the waitlist for the future of healthy eating in Morocco.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-fitnest-orange text-white hover:bg-fitnest-orange/90 rounded-full px-8 py-6 text-lg font-semibold"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                Join the Waitlist Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-fitnest-green rounded-full px-8 py-6 text-lg bg-transparent"
                onClick={() => (window.location.href = "/how-it-works")}
              >
                Learn More
              </Button>
            </div>
            <p className="text-sm text-white/80">
              No spam, ever. Unsubscribe at any time. Early access guaranteed for waitlist members.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
