"use client"

import dynamic from "next/dynamic"

// Loading component
function ExpressShopLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-center">
          <p className="text-lg">Loading products...</p>
        </div>
      </div>
    </div>
  )
}

// Dynamically import the client component with ssr disabled
const ClientExpressShop = dynamic(() => import("./client-express-shop"), {
  ssr: false,
  loading: () => <ExpressShopLoading />,
})

export default function ExpressShopWrapper() {
  return <ClientExpressShop />
}
