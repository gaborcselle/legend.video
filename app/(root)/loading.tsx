// this page gets called whenever you're loading a page for videos

import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center">
      <Skeleton className="h-[115px] w-[98%] rounded-x mt-10" />
      <Skeleton className="h-[43px] w-[98%] rounded-x mt-10" />
    </div>
  )
}