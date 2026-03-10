"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  Calendar,
  CalendarX,
  ChevronDown,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Event, PaginatedAPIResponse } from "@/lib/types";
import EventCardSkeleton from "../fallback/EventCardSkeleton";
import { EventCard } from "./EventCard";
import { useApiQuery } from "@/lib/hooks/use-api-query";

type FilterState = {
  search: string;
  category: string;
  is_paid: boolean | null;
  start_date: string;
  end_date: string;
};

type Category = { idx: string; name: string };

const PAGE_SIZE = 10;
const BASE_URL = "/api/event/events/";

const EMPTY_FILTERS: FilterState = {
  search: "",
  category: "",
  is_paid: null,
  start_date: "",
  end_date: "",
};

async function fetchEvents({
  pageParam = 1,
  filters,
}: {
  pageParam?: number;
  filters: FilterState;
}): Promise<PaginatedAPIResponse<Event>> {
  const params = new URLSearchParams({
    page: String(pageParam),
    page_size: String(PAGE_SIZE),
  });
  if (filters.search) params.set("search", filters.search);
  if (filters.category) params.set("category", filters.category);
  if (filters.is_paid !== null) params.set("is_paid", String(filters.is_paid));
  if (filters.start_date) params.set("start_date", filters.start_date);
  if (filters.end_date) params.set("end_date", filters.end_date);
  const res = await fetch(`${BASE_URL}?${params}`);
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
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

function countActive(f: FilterState): number {
  return [f.category, f.is_paid !== null, f.start_date, f.end_date].filter(
    Boolean,
  ).length;
}

function FilterChips({
  applied,
  categories,
  onRemove,
}: {
  applied: FilterState;
  categories: Category[];
  onRemove: (key: keyof FilterState) => void;
}) {
  const chips: { key: keyof FilterState; label: string }[] = [];

  if (applied.category) {
    const name =
      categories.find((c) => c.idx === applied.category)?.name ??
      applied.category;
    chips.push({ key: "category", label: `Category: ${name}` });
  }
  if (applied.is_paid === true)
    chips.push({ key: "is_paid", label: "Paid only" });
  if (applied.is_paid === false)
    chips.push({ key: "is_paid", label: "Free only" });
  if (applied.start_date)
    chips.push({ key: "start_date", label: `From: ${applied.start_date}` });
  if (applied.end_date)
    chips.push({ key: "end_date", label: `To: ${applied.end_date}` });

  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary"
        >
          {chip.label}
          <button
            type="button"
            onClick={() => onRemove(chip.key)}
            className="ml-0.5 rounded-full hover:text-primary/70"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
    </div>
  );
}

function EmptyState({ search }: { search: string }) {
  return (
    <div className="col-span-full flex flex-col items-center gap-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <CalendarX className="h-7 w-7 text-muted-foreground/60" />
      </div>
      <div>
        <p className="font-heading text-base font-semibold text-foreground">
          {search ? `No results for "${search}"` : "No events found"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {search
            ? "Try a different search term or clear the filter."
            : "Check back soon — new events are added regularly."}
        </p>
      </div>
    </div>
  );
}

export default function Events() {
  const [draft, setDraft] = useState<FilterState>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<FilterState>(EMPTY_FILTERS);
  const [search, setSearch] = useState("");

  const sentinelRef = useRef<HTMLDivElement>(null);

  const { data: catData } = useApiQuery<PaginatedAPIResponse<Category>>({
    url: "/api/event/categories/",
    queryKey: ["categories"],
  });
  const categories = catData?.results ?? [];

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["events", "infinite", applied],
    queryFn: ({ pageParam }) => fetchEvents({ pageParam, filters: applied }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.next ? allPages.length + 1 : undefined,
  });

  const throttledFetch = useThrottle(
    useCallback(() => {
      if (hasNextPage && !isFetchingNextPage) fetchNextPage();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]),
    800,
  );

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApplied((p) => ({ ...p, search }));
  };

  const handleRemoveChip = (key: keyof FilterState) => {
    const next = { ...applied, [key]: EMPTY_FILTERS[key] };
    setApplied(next);
    setDraft(next);
  };

  const activeCount = countActive(applied);
  const allEvents = data?.pages.flatMap((p) => p.results) ?? [];
  const totalCount = (data?.pages[0] as any)?.count ?? allEvents.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-8 sm:px-6">
          <h1 className="font-heading text-3xl font-bold text-foreground md:text-4xl">
            Discover events
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLoading ? "Loading…" : `${totalCount} events available`}
          </p>

          <form onSubmit={handleSearchSubmit} className="mt-5 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events, organizers, locations…"
                className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none ring-0 transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              Search
            </button>
            {(applied.search || activeCount > 0) && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setDraft(EMPTY_FILTERS);
                  setApplied(EMPTY_FILTERS);
                }}
                className="rounded-xl border border-border px-4 text-sm text-muted-foreground transition hover:bg-muted"
              >
                Clear all
              </button>
            )}
          </form>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="relative">
              <select
                aria-label="Filter by category"
                value={draft.category}
                onChange={(e) => {
                  const next = { ...draft, category: e.target.value };
                  setDraft(next);
                  setApplied((p) => ({ ...p, category: e.target.value }));
                }}
                className={cn(
                  "h-9 appearance-none rounded-full border pl-3.5 pr-7 text-xs font-semibold outline-none transition",
                  draft.category
                    ? "border-primary/30 bg-primary/5 text-primary"
                    : "border-border bg-muted/50 text-muted-foreground hover:bg-muted",
                )}
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c.idx} value={c.idx}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-current opacity-60" />
            </div>

            {(
              [
                { label: "Any price", value: null },
                { label: "Free", value: false },
                { label: "Paid", value: true },
              ] as const
            ).map((opt) => (
              <button
                key={String(opt.label)}
                type="button"
                onClick={() => {
                  const next = { ...draft, is_paid: opt.value };
                  setDraft(next);
                  setApplied((p) => ({ ...p, is_paid: opt.value }));
                }}
                className={cn(
                  "h-9 rounded-full border px-4 text-xs font-semibold transition-all duration-150",
                  draft.is_paid === opt.value
                    ? "border-primary/30 bg-primary/5 text-primary"
                    : "border-border bg-muted/50 text-muted-foreground hover:bg-muted",
                )}
              >
                {opt.label}
              </button>
            ))}

            <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 h-9">
              <Calendar className="h-3 w-3 shrink-0 text-muted-foreground" />
              <input
                type="date"
                aria-label="Start date"
                value={draft.start_date}
                onChange={(e) => {
                  const next = { ...draft, start_date: e.target.value };
                  setDraft(next);
                  setApplied((p) => ({ ...p, start_date: e.target.value }));
                }}
                className="w-[110px] bg-transparent text-xs text-muted-foreground outline-none [color-scheme:light] dark:[color-scheme:dark]"
              />
              <span className="text-xs text-muted-foreground/50">–</span>
              <input
                aria-label="End date"
                type="date"
                value={draft.end_date}
                min={draft.start_date || undefined}
                onChange={(e) => {
                  const next = { ...draft, end_date: e.target.value };
                  setDraft(next);
                  setApplied((p) => ({ ...p, end_date: e.target.value }));
                }}
                className="w-[110px] bg-transparent text-xs text-muted-foreground outline-none [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>

            {activeCount > 0 && (
              <span className="ml-1 flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                  {activeCount}
                </span>
                active
              </span>
            )}
          </div>

          {activeCount > 0 && (
            <div className="mt-3">
              <FilterChips
                applied={applied}
                categories={categories}
                onRemove={handleRemoveChip}
              />
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 sm:px-6">
        {isError ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <p className="text-sm text-muted-foreground">
              Failed to load events. Please try again.
            </p>
            <button
              onClick={() => setApplied({ ...applied })}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading &&
              Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <EventCardSkeleton key={i} />
              ))}
            {!isLoading && allEvents.length === 0 && (
              <EmptyState search={applied.search} />
            )}
            {allEvents.map((ev, i) => (
              <EventCard key={ev.idx} event={ev} index={i} />
            ))}
            {isFetchingNextPage &&
              Array.from({ length: 4 }).map((_, i) => (
                <EventCardSkeleton key={`next-${i}`} />
              ))}
          </div>
        )}

        <div
          ref={sentinelRef}
          className="mt-8 flex items-center justify-center py-4"
        >
          {isFetchingNextPage && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading more…
            </div>
          )}
          {!hasNextPage && allEvents.length > 0 && (
            <p className="text-xs text-muted-foreground">
              You've seen all {allEvents.length} events ✓
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
