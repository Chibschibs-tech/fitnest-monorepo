import { Skeleton } from "@/components/ui/skeleton"

export default function ExpressShopLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <Skeleton className="mx-auto mb-2 h-10 w-48" />
        <Skeleton className="mx-auto h-6 w-96" />
      </div>

      <div className="mb-8 flex flex-wrap justify-center gap-2">
        <Skeleton className="h-10 w-24 rounded-full" />
        <Skeleton className="h-10 w-24 rounded-full" />
        <Skeleton className="h-10 w-24 rounded-full" />
        <Skeleton className="h-10 w-24 rounded-full" />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="flex flex-col overflow-hidden rounded-lg border border-gray-200">
            <Skeleton className="aspect-square w-full" />
            <div className="flex flex-1 flex-col p-4">
              <div className="mb-2">
                <Skeleton className="mb-1 h-4 w-16" />
                <Skeleton className="mb-2 h-6 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="mt-1 h-4 w-3/4" />
              </div>
              <div className="mt-auto space-y-3">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
