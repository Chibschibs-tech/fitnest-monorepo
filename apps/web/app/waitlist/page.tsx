"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Star, Users, Calendar, ChefHat, Truck, Leaf, Heart, Shield, Award, CheckCircle2, Loader2, Dumbbell, Scale } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useLanguage } from "@/components/language-provider"
import { getTranslations } from "@/lib/i18n"

export default function WaitlistPage() {
  const { locale } = useLanguage()
  const [mounted, setMounted] = useState(false)
  const t = getTranslations(locale)
  
  useEffect(() => {
    setMounted(true)
  }, [])

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
        setError(t.waitlist.form.error)
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
        setError(t.waitlist.form.errorGeneric)
      }
    } catch (err: any) {
      console.error("Waitlist submission error:", err)
      setError(err.message || t.waitlist.form.errorGeneric)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return null
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
                  {t.waitlist.hero.badge}
                </Badge>
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight">
                  {t.waitlist.hero.title}
                  <span className="text-fitnest-orange"> {t.waitlist.hero.titleHighlight}</span>
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-white/90 leading-relaxed">
                  {t.waitlist.hero.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <ChefHat className="h-4 w-4 sm:h-5 sm:w-5 text-fitnest-orange" />
                  <span>{t.waitlist.hero.chefPrepared}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Leaf className="h-4 w-4 sm:h-5 sm:w-5 text-fitnest-orange" />
                  <span>{t.waitlist.hero.freshIngredients}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-fitnest-orange" />
                  <span>{t.waitlist.hero.freeDelivery}</span>
                </div>
              </div>

              {/* Waitlist Reason */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                  {t.waitlist.waitlistReason.description}
                </p>
              </div>

              {/* Waitlist Form */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-lg">
                <CardContent className="p-4 sm:p-6">
                  {success ? (
                    <div className="text-center space-y-4">
                      <CheckCircle2 className="h-12 w-12 text-fitnest-orange mx-auto" />
                      <h3 className="text-xl font-bold text-white">{t.waitlist.form.success}</h3>
                      <p className="text-white/90">{t.waitlist.form.redirecting}</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {error && (
                        <Alert variant="destructive" className="bg-red-50 border-red-200">
                          <AlertDescription className="text-red-800">{error}</AlertDescription>
                        </Alert>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-white/90 text-sm">
                            {t.waitlist.form.firstName}
                          </Label>
                          <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            placeholder={locale === "fr" ? "Prénom" : "First name"}
                            className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 rounded-full"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-white/90 text-sm">
                            {t.waitlist.form.lastName}
                          </Label>
                          <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            placeholder={locale === "fr" ? "Nom" : "Last name"}
                            className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 rounded-full"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-white/90 text-sm">
                          {t.waitlist.form.email}
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
                          {t.waitlist.form.phone}
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder={t.waitlist.form.phonePlaceholder}
                          className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 rounded-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mealPlan" className="text-white/90 text-sm">
                          {t.waitlist.form.mealPlan}
                        </Label>
                        <Select value={formData.mealPlan} onValueChange={(value) => setFormData({ ...formData, mealPlan: value })}>
                          <SelectTrigger className="bg-white/20 border-white/30 text-white rounded-full">
                            <SelectValue placeholder={t.waitlist.form.selectPlan} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low-carb">{t.waitlist.mealPlans.lowCarb.title}</SelectItem>
                            <SelectItem value="balanced">{t.waitlist.mealPlans.balanced.title}</SelectItem>
                            <SelectItem value="protein-power">{t.waitlist.mealPlans.proteinPower.title}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-white/90 text-sm">
                          {t.waitlist.form.city}
                        </Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder={t.waitlist.form.cityPlaceholder}
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
                          {t.waitlist.form.notifications}
                        </Label>
                      </div>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-fitnest-orange text-white hover:bg-fitnest-orange/90 rounded-full py-4 sm:py-6 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            {t.waitlist.form.submitting}
                          </>
                        ) : (
                          t.waitlist.form.submit
                        )}
                      </Button>
                      <p className="text-xs text-white/80 text-center">
                        {t.waitlist.form.privacy}
                      </p>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="relative order-1 lg:order-2 mb-8 lg:mb-0">
              <div className="relative z-10">
                <Image
                  src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&h=800&fit=crop&q=80"
                  alt="Healthy meal delivery service in Morocco - Fresh, nutritious meals prepared with care"
                  width={600}
                  height={400}
                  className="rounded-2xl sm:rounded-3xl shadow-2xl object-cover w-full h-auto"
                  priority
                />
              </div>
              <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 w-48 h-48 sm:w-72 sm:h-72 bg-fitnest-orange/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-4 -left-4 sm:-bottom-8 sm:-left-8 w-64 h-64 sm:w-96 sm:h-96 bg-fitnest-green/20 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-8 sm:py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-8 text-center">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-fitnest-green" />
              <span className="text-base sm:text-lg font-semibold text-gray-900">{t.waitlist.socialProof.waitlistCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 sm:h-6 sm:w-6 text-fitnest-orange fill-current" />
              <span className="text-base sm:text-lg font-semibold text-gray-900">{t.waitlist.socialProof.rating}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-fitnest-green" />
              <span className="text-base sm:text-lg font-semibold text-gray-900">{t.waitlist.socialProof.launch}</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">{t.waitlist.howItWorks.title}</h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              {t.waitlist.howItWorks.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Card className="text-center p-6 sm:p-8 hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-fitnest-green/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-xl sm:text-2xl font-bold text-fitnest-green">1</span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold">{t.waitlist.howItWorks.step1.title}</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {t.waitlist.howItWorks.step1.description}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 sm:p-8 hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-fitnest-green/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-xl sm:text-2xl font-bold text-fitnest-green">2</span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold">{t.waitlist.howItWorks.step2.title}</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {t.waitlist.howItWorks.step2.description}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 sm:p-8 hover:shadow-lg transition-shadow border-0 shadow-md sm:col-span-2 lg:col-span-1">
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-fitnest-green/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-xl sm:text-2xl font-bold text-fitnest-green">3</span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold">{t.waitlist.howItWorks.step3.title}</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {t.waitlist.howItWorks.step3.description}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Meal Plans Preview */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">{t.waitlist.mealPlans.title}</h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              {t.waitlist.mealPlans.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Card className="overflow-hidden hover:shadow-xl transition-shadow border-0 shadow-md">
              <div className="relative h-40 sm:h-48 bg-gradient-to-br from-fitnest-green/20 to-fitnest-green/10">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Leaf className="h-20 w-20 sm:h-24 sm:w-24 text-fitnest-green/30" />
                </div>
                <Badge className="absolute top-4 left-4 bg-fitnest-orange rounded-full text-xs sm:text-sm">{t.waitlist.mealPlans.lowCarb.badge}</Badge>
              </div>
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-2">{t.waitlist.mealPlans.lowCarb.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  {t.waitlist.mealPlans.lowCarb.description}
                </p>
                <div className="space-y-2 text-xs sm:text-sm text-gray-500">
                  <div className="flex justify-between">
                    <span>{t.waitlist.mealPlans.lowCarb.calories}</span>
                    <span>{t.waitlist.mealPlans.lowCarb.caloriesValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.waitlist.mealPlans.lowCarb.protein}</span>
                    <span>{t.waitlist.mealPlans.lowCarb.proteinValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.waitlist.mealPlans.lowCarb.startingAt}</span>
                    <span className="font-semibold text-fitnest-green">{t.waitlist.mealPlans.lowCarb.price}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-xl transition-shadow border-0 shadow-md">
              <div className="relative h-40 sm:h-48 bg-gradient-to-br from-fitnest-orange/20 to-fitnest-orange/10">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Scale className="h-20 w-20 sm:h-24 sm:w-24 text-fitnest-orange/30" />
                </div>
              </div>
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-2">{t.waitlist.mealPlans.balanced.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  {t.waitlist.mealPlans.balanced.description}
                </p>
                <div className="space-y-2 text-xs sm:text-sm text-gray-500">
                  <div className="flex justify-between">
                    <span>{t.waitlist.mealPlans.balanced.calories}</span>
                    <span>{t.waitlist.mealPlans.balanced.caloriesValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.waitlist.mealPlans.balanced.macros}</span>
                    <span>{t.waitlist.mealPlans.balanced.macrosValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.waitlist.mealPlans.balanced.startingAt}</span>
                    <span className="font-semibold text-fitnest-green">{t.waitlist.mealPlans.balanced.price}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-xl transition-shadow border-0 shadow-md">
              <div className="relative h-40 sm:h-48 bg-gradient-to-br from-fitnest-green/30 to-fitnest-orange/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Dumbbell className="h-20 w-20 sm:h-24 sm:w-24 text-fitnest-green/30" />
                </div>
              </div>
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-2">{t.waitlist.mealPlans.proteinPower.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  {t.waitlist.mealPlans.proteinPower.description}
                </p>
                <div className="space-y-2 text-xs sm:text-sm text-gray-500">
                  <div className="flex justify-between">
                    <span>{t.waitlist.mealPlans.proteinPower.calories}</span>
                    <span>{t.waitlist.mealPlans.proteinPower.caloriesValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.waitlist.mealPlans.proteinPower.protein}</span>
                    <span>{t.waitlist.mealPlans.proteinPower.proteinValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.waitlist.mealPlans.proteinPower.startingAt}</span>
                    <span className="font-semibold text-fitnest-green">{t.waitlist.mealPlans.proteinPower.price}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">{t.waitlist.testimonials.title}</h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600">{t.waitlist.testimonials.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Card className="p-6 border-0 shadow-md">
              <CardContent className="space-y-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-fitnest-orange fill-current" />
                  ))}
                </div>
                <p className="text-gray-600">
                  "{t.waitlist.testimonials.testimonial1.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-fitnest-green/20 rounded-full flex items-center justify-center">
                    <span className="text-fitnest-green font-semibold">AM</span>
                  </div>
                  <div>
                    <div className="font-semibold">{t.waitlist.testimonials.testimonial1.author}</div>
                    <div className="text-sm text-gray-500">{t.waitlist.testimonials.testimonial1.location}</div>
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
                  "{t.waitlist.testimonials.testimonial2.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-fitnest-orange/20 rounded-full flex items-center justify-center">
                    <span className="text-fitnest-orange font-semibold">YK</span>
                  </div>
                  <div>
                    <div className="font-semibold">{t.waitlist.testimonials.testimonial2.author}</div>
                    <div className="text-sm text-gray-500">{t.waitlist.testimonials.testimonial2.location}</div>
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
                  "{t.waitlist.testimonials.testimonial3.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-fitnest-green/20 rounded-full flex items-center justify-center">
                    <span className="text-fitnest-green font-semibold">FZ</span>
                  </div>
                  <div>
                    <div className="font-semibold">{t.waitlist.testimonials.testimonial3.author}</div>
                    <div className="text-sm text-gray-500">{t.waitlist.testimonials.testimonial3.location}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">{t.waitlist.features.title}</h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              {t.waitlist.features.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center space-y-3 sm:space-y-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-fitnest-green/10 rounded-full flex items-center justify-center mx-auto">
                <Heart className="h-7 w-7 sm:h-8 sm:w-8 text-fitnest-green" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold">{t.waitlist.features.madeWithLove.title}</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                {t.waitlist.features.madeWithLove.description}
              </p>
            </div>

            <div className="text-center space-y-3 sm:space-y-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-fitnest-green/10 rounded-full flex items-center justify-center mx-auto">
                <Shield className="h-7 w-7 sm:h-8 sm:w-8 text-fitnest-green" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold">{t.waitlist.features.foodSafety.title}</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                {t.waitlist.features.foodSafety.description}
              </p>
            </div>

            <div className="text-center space-y-3 sm:space-y-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-fitnest-green/10 rounded-full flex items-center justify-center mx-auto">
                <Leaf className="h-7 w-7 sm:h-8 sm:w-8 text-fitnest-green" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold">{t.waitlist.features.localFresh.title}</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                {t.waitlist.features.localFresh.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">{t.waitlist.faq.title}</h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600">{t.waitlist.faq.subtitle}</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
            <Card className="border-0 shadow-md">
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold mb-2">{t.waitlist.faq.q1.question}</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {t.waitlist.faq.q1.answer}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold mb-2">{t.waitlist.faq.q2.question}</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {t.waitlist.faq.q2.answer}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold mb-2">{t.waitlist.faq.q3.question}</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {t.waitlist.faq.q3.answer}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold mb-2">{t.waitlist.faq.q4.question}</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {t.waitlist.faq.q4.answer}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold mb-2">{t.waitlist.faq.q5.question}</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {t.waitlist.faq.q5.answer}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-fitnest-green to-fitnest-green/90">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8 text-white">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">{t.waitlist.cta.title}</h2>
            <p className="text-base sm:text-lg lg:text-xl text-white/90">
              {t.waitlist.cta.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button
                size="lg"
                className="bg-fitnest-orange text-white hover:bg-fitnest-orange/90 rounded-full px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl w-full sm:w-auto"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                {t.waitlist.cta.joinNow}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-fitnest-green rounded-full px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg bg-transparent w-full sm:w-auto"
                onClick={() => (window.location.href = "/how-it-works")}
              >
                {t.waitlist.cta.learnMore}
              </Button>
            </div>
            <p className="text-xs sm:text-sm text-white/80">
              {t.waitlist.cta.privacy}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
