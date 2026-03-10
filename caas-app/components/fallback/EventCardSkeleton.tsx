"use client";

import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";

function EventCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card">
      <Skeleton className="h-44 w-full rounded-none rounded-t-3xl" />

      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
        </div>

        <div className="flex flex-col gap-2 pt-0.5">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3.5 w-3.5 shrink-0 rounded-full" />
            <Skeleton className="h-3.5 w-28" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-3.5 w-3.5 shrink-0 rounded-full" />
            <Skeleton className="h-3.5 w-40" />
          </div>
        </div>

        <div className="h-px w-full bg-border/60" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-7 rounded-full" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-2.5 w-14" />
            </div>
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>

        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function EventCardGridLoader({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default EventCardSkeleton;
