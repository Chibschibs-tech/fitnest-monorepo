import { Skeleton } from "@/components/ui/skeleton"

export default function MealPlansLoading() {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <Skeleton className="h-10 w-3/4 mx-auto mb-4" />
        <Skeleton className="h-5 w-full mx-auto" />
        <Skeleton className="h-5 w-5/6 mx-auto mt-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-[500px] w-full rounded-lg" />
        ))}
      </div>

      <Skeleton className="h-[300px] w-full rounded-xl mb-16" />

      <div className="text-center max-w-3xl mx-auto">
        <Skeleton className="h-8 w-2/3 mx-auto mb-4" />
        <Skeleton className="h-5 w-full mx-auto mb-2" />
        <Skeleton className="h-5 w-5/6 mx-auto mb-6" />
        <Skeleton className="h-12 w-40 mx-auto" />
      </div>
    </div>
  )
}
