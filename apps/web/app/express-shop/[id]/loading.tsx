import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function ProductDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Link
        href="/express-shop"
        className="mb-6 inline-flex items-center text-sm font-medium text-gray-600 hover:text-green-600"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Products
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-lg" />

        <div>
          <Skeleton className="mb-2 h-5 w-24" />
          <Skeleton className="mb-4 h-10 w-3/4" />

          <Skeleton className="mb-6 h-8 w-32" />

          <div className="mb-8">
            <Skeleton className="mb-2 h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-3/4" />
          </div>

          <div className="mb-6">
            <Skeleton className="mb-2 h-5 w-24" />
            <div className="flex w-32 items-center">
              <Skeleton className="h-10 w-10 rounded-r-none" />
              <Skeleton className="h-10 w-12 rounded-none" />
              <Skeleton className="h-10 w-10 rounded-l-none" />
            </div>
          </div>

          <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
