"use client"

import dynamic from "next/dynamic"

// Loading component
function ProductDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-center">
          <p className="text-lg">Loading product details...</p>
        </div>
      </div>
    </div>
  )
}

// Dynamically import the client component with ssr disabled
const ClientProductDetail = dynamic(() => import("./client-product-detail"), {
  ssr: false,
  loading: () => <ProductDetailLoading />,
})

export default function ProductDetailWrapper({ id }: { id: string }) {
  return <ClientProductDetail id={id} />
}
