import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center">
      <Skeleton className="h-[253px] max-w-[862px] w-5/6 rounded-x mt-10" />
      <Skeleton className="h-[553px] max-w-[862px] w-5/6 rounded-x mt-10" />
    </div>
  )
}