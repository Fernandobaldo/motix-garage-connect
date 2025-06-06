
import { Skeleton } from "@/components/ui/skeleton"

export const CardSkeleton = () => (
  <div className="rounded-lg border p-6 space-y-4">
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-2/3" />
    <div className="flex space-x-2">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-24" />
    </div>
  </div>
)

export const TestimonialSkeleton = () => (
  <div className="rounded-lg bg-white p-6 shadow-sm space-y-4">
    <div className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-4/5" />
    <div className="flex space-x-1">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-4 w-4 rounded" />
      ))}
    </div>
  </div>
)

export const PricingCardSkeleton = () => (
  <div className="rounded-lg border bg-white p-6 shadow-sm space-y-4">
    <div className="space-y-2">
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-4 w-32" />
    </div>
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
    <Skeleton className="h-10 w-full" />
  </div>
)

export const FAQSkeleton = () => (
  <div className="space-y-4">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="border rounded-lg p-4">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    ))}
  </div>
)
