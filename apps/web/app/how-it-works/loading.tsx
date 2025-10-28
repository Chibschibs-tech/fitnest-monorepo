import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Skeleton className="h-12 w-3/4 mx-auto mb-8" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-6">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-20 w-full" />
          </div>
        ))}
      </div>

      <Skeleton className="h-64 w-full mb-12" />

      <div className="text-center">
        <Skeleton className="h-8 w-1/2 mx-auto mb-4" />
        <Skeleton className="h-12 w-48 mx-auto" />
      </div>
    </div>
  )
}
