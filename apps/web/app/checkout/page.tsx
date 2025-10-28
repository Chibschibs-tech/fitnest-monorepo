import { redirect } from "next/navigation"
import { Suspense } from "react"
import { CheckoutContent } from "./checkout-content"
import { LoadingSpinner } from "@/components/loading-spinner"

// Force dynamic rendering to avoid prerendering issues
export const dynamic = "force-dynamic"

export default async function CheckoutPage() {
  // This is a server component that will redirect if not authenticated
  try {
    // We'll handle authentication in the checkout content component
    return (
      <Suspense fallback={<CheckoutLoading />}>
        <CheckoutContent />
      </Suspense>
    )
  } catch (error) {
    console.error("Error in checkout page:", error)
    redirect("/login?redirect=/checkout")
  }
}

function CheckoutLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>
      <div className="flex h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    </div>
  )
}
