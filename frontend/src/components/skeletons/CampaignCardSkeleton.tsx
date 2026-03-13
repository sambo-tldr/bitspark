import { Skeleton } from "@/components/ui/skeleton";

export function CampaignCardSkeleton() {
  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="h-48 w-full shimmer" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-3 w-20 shimmer" />
        <Skeleton className="h-6 w-3/4 shimmer" />
        <Skeleton className="h-2 w-full rounded-full shimmer" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24 shimmer" />
          <Skeleton className="h-4 w-16 shimmer" />
        </div>
      </div>
    </div>
  );
}
