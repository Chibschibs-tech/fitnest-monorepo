import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"

export default function CartNotFound() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold">Cart Not Found</h1>
      <div className="rounded-lg border border-gray-200 p-6 text-center">
        <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <h2 className="mb-2 text-xl font-medium">We couldn't find your cart</h2>
        <p className="mb-6 text-gray-600">The cart you're looking for doesn't exist or has been removed.</p>
        <Link href="/express-shop">
          <Button className="bg-green-600 hover:bg-green-700">Browse Products</Button>
        </Link>
      </div>
    </div>
  )
}
