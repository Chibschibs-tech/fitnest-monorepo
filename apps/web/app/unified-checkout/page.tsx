import { Suspense } from "react"
import CheckoutWrapper from "./checkout-wrapper"

// Loading component
function CheckoutLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold">Checkout</h1>
        <p className="mx-auto max-w-2xl text-gray-600">Complete your purchase.</p>
      </div>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-center">
          <p className="text-lg">Loading checkout...</p>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: "Checkout | Fitnest.ma",
  description: "Complete your purchase.",
}

// Prevent static generation for this page
export const dynamic = "force-dynamic"

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutWrapper />
    </Suspense>
  )
}
