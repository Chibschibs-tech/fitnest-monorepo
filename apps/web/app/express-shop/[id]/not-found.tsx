import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingBag } from "lucide-react"

export default function ProductNotFound() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-md text-center">
        <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-gray-400" />
        <h1 className="mb-2 text-2xl font-bold">Product Not Found</h1>
        <p className="mb-6 text-gray-600">The product you're looking for doesn't exist or has been removed.</p>
        <Link href="/express-shop">
          <Button className="bg-green-600 hover:bg-green-700">Browse Products</Button>
        </Link>
      </div>
    </div>
  )
}
