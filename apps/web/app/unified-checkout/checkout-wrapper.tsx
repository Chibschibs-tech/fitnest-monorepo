"use client"

import dynamic from "next/dynamic"

// Loading component
function CheckoutLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-center">
          <p className="text-lg">Loading checkout...</p>
        </div>
      </div>
    </div>
  )
}

// Dynamically import the client component with ssr disabled
const ClientCheckout = dynamic(() => import("./client-checkout"), {
  ssr: false,
  loading: () => <CheckoutLoading />,
})

export default function CheckoutWrapper() {
  return <ClientCheckout />
}
