import { Skeleton } from "@/components/ui/skeleton"

export default function MealPlanLoading() {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <Skeleton className="h-6 w-32 mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-5 w-full mb-2" />
          <Skeleton className="h-5 w-5/6 mb-6" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>

          <Skeleton className="h-12 w-full mb-2" />
          <Skeleton className="h-40 w-full rounded-md mb-8" />

          <Skeleton className="h-8 w-40 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-80 w-full rounded-lg" />
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <Skeleton className="h-[400px] w-full rounded-lg" />
          </div>
        </div>
      </div>

      <Skeleton className="h-[200px] w-full rounded-xl" />
    </div>
  )
}
