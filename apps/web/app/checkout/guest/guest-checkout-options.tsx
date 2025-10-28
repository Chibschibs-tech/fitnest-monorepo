"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, LogIn, UserPlus } from "lucide-react"

export function GuestCheckoutOptions() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleGuestCheckout = () => {
    setIsLoading(true)
    router.push("/checkout/guest-details")
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Checkout Options</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-green-100 hover:border-green-300 transition-colors">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center">
              <UserPlus className="mr-2 h-5 w-5 text-green-600" />
              Sign Up
            </CardTitle>
            <CardDescription>Create an account to track orders and save preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <ul className="space-y-2">
              <li className="flex items-start">
                <ArrowRight className="mr-2 h-4 w-4 text-green-600 mt-0.5" />
                <span>Save your delivery information for future orders</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="mr-2 h-4 w-4 text-green-600 mt-0.5" />
                <span>Track your order status and delivery</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="mr-2 h-4 w-4 text-green-600 mt-0.5" />
                <span>Manage your meal preferences and subscriptions</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Link href={`/register?callbackUrl=${encodeURIComponent("/checkout")}`} className="w-full">
              <Button className="w-full bg-green-600 hover:bg-green-700">Create Account</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-gray-100 hover:border-gray-300 transition-colors">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center">
              <LogIn className="mr-2 h-5 w-5 text-gray-600" />
              Guest Checkout
            </CardTitle>
            <CardDescription>Continue without creating an account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <ul className="space-y-2">
              <li className="flex items-start">
                <ArrowRight className="mr-2 h-4 w-4 text-gray-600 mt-0.5" />
                <span>Quick checkout without registration</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="mr-2 h-4 w-4 text-gray-600 mt-0.5" />
                <span>Receive order confirmation via email</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="mr-2 h-4 w-4 text-gray-600 mt-0.5" />
                <span>Option to create an account later</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button onClick={handleGuestCheckout} className="w-full bg-gray-600 hover:bg-gray-700" disabled={isLoading}>
              Continue as Guest
            </Button>
          </CardFooter>
        </Card>

        <div className="md:col-span-2 text-center mt-4">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link
              href={`/login?callbackUrl=${encodeURIComponent("/checkout")}`}
              className="text-green-600 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
