"use client";

import { useEffect, useRef, useCallback } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, CalendarX, Loader2, Tag } from "lucide-react";
import { Event } from "@/lib/types";
import EventCardSkeleton from "../fallback/EventCardSkeleton";
import { EventCard } from "./EventCard";

type Category = {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  event_count: number;
};

type PaginatedResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Event[];
};

const PAGE_SIZE = 10;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

function statusFromDates(start: string, end: string) {
  const now = Date.now();
  if (now < new Date(start).getTime())
    return { label: "Upcoming", cls: "bg-primary/10 text-primary" };
  if (now > new Date(end).getTime())
    return { label: "Ended", cls: "bg-muted text-muted-foreground" };
  return {
    label: "Live now",
    cls: "bg-secondary/10 text-secondary animate-pulse",
  };
}

function useThrottle<T extends (...args: any[]) => void>(
  fn: T,
  delay: number,
): T {
  const lastCall = useRef(0);
  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        fn(...args);
      }
    },
    [fn, delay],
  ) as T;
}

async function fetchCategory(id: string): Promise<Category> {
  const res = await fetch(`/api/event/categories/${id}/`);
  if (!res.ok) throw new Error("Failed to fetch category");
  return res.json();
}

async function fetchCategoryEvents({
  pageParam = 1,
  categoryId,
}: {
  pageParam?: number;
  categoryId: string;
}): Promise<PaginatedResponse> {
  const params = new URLSearchParams({
    page: String(pageParam),
    page_size: String(PAGE_SIZE),
    category: categoryId,
  });
  const res = await fetch(`/api/event/events/?${params}`);
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
}

function HeroSkeleton() {
  return (
    <div className="relative overflow-hidden border-b border-border bg-muted">
      <div className="h-56 animate-pulse bg-muted/60 md:h-72" />
    </div>
  );
}

function EmptyState({ categoryName }: { categoryName: string }) {
  return (
    <div className="col-span-full flex flex-col items-center gap-4 py-20 md:py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <CalendarX className="h-7 w-7 text-muted-foreground/50" />
      </div>
      <div>
        <p className="font-heading text-base font-semibold text-foreground">
          No events in {categoryName}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Check back soon — new events are added regularly.
        </p>
      </div>
      <Link
        href="/events"
        className="mt-1 rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-muted"
      >
        Browse all events
      </Link>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

function CategoryDetails({ id }: { id: string }) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Category metadata
  const { data: category, isLoading: catLoading } = useQuery({
    queryKey: ["category", id],
    queryFn: () => fetchCategory(id),
  });

  // Paginated events
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: eventsLoading,
  } = useInfiniteQuery({
    queryKey: ["category-events", id],
    queryFn: ({ pageParam }) =>
      fetchCategoryEvents({ pageParam, categoryId: id }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.next ? allPages.length + 1 : undefined,
  });

  // Throttled fetch — max once per 800ms
  const throttledFetch = useThrottle(
    useCallback(() => {
      if (hasNextPage && !isFetchingNextPage) fetchNextPage();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]),
    800,
  );

  // IntersectionObserver
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) throttledFetch();
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [throttledFetch]);

  const allEvents = data?.pages.flatMap((p) => p.results) ?? [];
  const totalCount = data?.pages[0]?.count ?? 0;

  return (
    <div className="min-h-screen bg-background">
      {catLoading ? (
        <HeroSkeleton />
      ) : (
        <div className="relative overflow-hidden border-b border-border">
          {category?.image ? (
            <div className="absolute inset-0">
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10" />
          )}

          <div className="relative mx-auto container px-4 py-12 sm:px-6 md:py-16">
            <Link
              href="/events"
              className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> All events
            </Link>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-3">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <Tag className="h-3 w-3" /> Category
                </span>

                <h1 className="font-heading text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
                  {category?.name}
                </h1>

                {category?.description && (
                  <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                    {category.description}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-border bg-card/80 px-5 py-3 backdrop-blur-sm">
                <Calendar className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-heading text-xl font-bold text-foreground">
                    {eventsLoading ? "—" : totalCount}
                  </p>
                  <p className="text-[10px] text-muted-foreground">events</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto container px-4 py-8 sm:px-6">
        {!eventsLoading && allEvents.length > 0 && (
          <p className="mb-5 text-xs text-muted-foreground">
            Showing {allEvents.length} of {totalCount} events
          </p>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {eventsLoading &&
            Array.from({ length: 8 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}

          {!eventsLoading && allEvents.length === 0 && (
            <EmptyState categoryName={category?.name ?? "this category"} />
          )}

          {allEvents.map((ev, i) => (
            <EventCard key={ev.idx} event={ev} index={i} />
          ))}

          {isFetchingNextPage &&
            Array.from({ length: 4 }).map((_, i) => (
              <EventCardSkeleton key={`next-${i}`} />
            ))}
        </div>

        <div
          ref={sentinelRef}
          className="mt-10 flex items-center justify-center py-6"
        >
          {isFetchingNextPage && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading more…
            </div>
          )}
          {!hasNextPage && allEvents.length > 0 && (
            <p className="text-xs text-muted-foreground">
              All {allEvents.length} events loaded ✓
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default CategoryDetails;
