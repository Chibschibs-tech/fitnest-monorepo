"use client"

import dynamic from "next/dynamic"

// Placeholder component while loading
function CartIconPlaceholder() {
  return <div className="h-6 w-6 rounded-full bg-transparent"></div>
}

// Dynamically import the cart icon component
const DynamicCartIcon = dynamic(() => import("./cart-icon"), {
  ssr: false,
  loading: () => <CartIconPlaceholder />,
})

export default function CartIconWrapper() {
  return <DynamicCartIcon />
}
