import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex flex-col items-center p-10 gap-10">
      <h1 className="text-2xl font-bold text-center">Add Credits</h1>
      <div className="flex flex-col lg:flex-row gap-10">
        <Skeleton className="min-w-56 h-[95px]" />
        <Skeleton className="min-w-56 h-[95px]" />
        <Skeleton className="min-w-56 h-[95px]" />
      </div>
      <Skeleton className="w-40 h-12" />
    </div>
  )
}