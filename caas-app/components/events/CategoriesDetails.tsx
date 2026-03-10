"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CalendarX,
  Loader2,
  Tag,
  TrendingUp,
  Star,
  SlidersHorizontal,
  Search,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Event } from "@/lib/types";
import EventCardSkeleton from "../fallback/EventCardSkeleton";
import { EventCard } from "./EventCard";

// ─── TYPES ────────────────────────────────────────────────────────────────────

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

type SortOption = "date_asc" | "date_desc" | "popular" | "newest";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 12;

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "date_asc", label: "Date: Soonest" },
  { value: "date_desc", label: "Date: Latest" },
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newly Added" },
];

// ─── UTILS ────────────────────────────────────────────────────────────────────

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

function statusFromDates(start: string, end: string) {
  const now = Date.now();
  if (now < new Date(start).getTime()) return "upcoming";
  if (now > new Date(end).getTime()) return "ended";
  return "live";
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

// ─── FETCHERS ─────────────────────────────────────────────────────────────────

async function fetchCategory(id: string): Promise<Category> {
  const res = await fetch(`/api/event/categories/${id}/`);
  if (!res.ok) throw new Error("Failed to fetch category");
  return res.json();
}

async function fetchCategoryEvents({
  pageParam = 1,
  categoryId,
  sort,
  search,
}: {
  pageParam?: number;
  categoryId: string;
  sort: SortOption;
  search: string;
}): Promise<PaginatedResponse> {
  const params = new URLSearchParams({
    page: String(pageParam),
    page_size: String(PAGE_SIZE),
    category: categoryId,
    ordering: sort,
    ...(search ? { search } : {}),
  });
  const res = await fetch(`/api/event/events/?${params}`);
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
}

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function HeroSkeleton() {
  return (
    <div className="border-b border-border bg-muted">
      <div className="h-64 animate-pulse bg-muted/60 md:h-80" />
    </div>
  );
}

function StatPill({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ElementType;
  value: string | number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/80 px-5 py-3 backdrop-blur-sm">
      <Icon className="h-4 w-4 shrink-0 text-primary" />
      <div>
        <p className="text-xl font-extrabold leading-none text-foreground">
          {value}
        </p>
        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
      </div>
    </div>
  );
}

function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex h-9 min-w-[180px] items-center gap-2 rounded-xl border border-border bg-card px-3 transition-colors focus-within:border-primary">
      <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <input
        type="text"
        placeholder="Search events…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}

function SortDropdown({
  value,
  onChange,
}: {
  value: SortOption;
  onChange: (v: SortOption) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = SORT_OPTIONS.find((o) => o.value === value)!;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 items-center gap-2 whitespace-nowrap rounded-xl border border-border bg-card px-3.5 text-sm font-semibold text-foreground transition hover:bg-muted"
      >
        <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
        {current.label}
        <ChevronDown
          className={cn(
            "h-3 w-3 text-muted-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-50 min-w-[160px] rounded-2xl border border-border bg-card p-1.5 shadow-xl">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={cn(
                "block w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-muted",
                opt.value === value
                  ? "bg-primary/10 font-bold text-primary"
                  : "font-medium text-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FeaturedBanner({ events }: { events: Event[] }) {
  const featured = events.slice(0, 3);
  if (featured.length < 3) return null;

  return (
    <section className="pt-8">
      <div className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
        <TrendingUp className="h-3.5 w-3.5 text-primary" />
        Trending in this category
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {featured.map((ev) => (
          <Link
            key={ev.idx}
            href={`/events/${ev.idx}`}
            className="group relative block h-44 overflow-hidden rounded-2xl bg-muted"
          >
            {ev.cover_image && (
              <Image
                src={ev.cover_image}
                alt={ev.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <span className="mb-1.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-amber-400">
                <Star className="h-3 w-3" /> Featured
              </span>
              <h3 className="line-clamp-2 text-sm font-bold leading-snug text-white">
                {ev.title}
              </h3>
              <p className="mt-1 flex items-center gap-1 text-[11px] text-white/70">
                <Calendar className="h-3 w-3" />
                {formatDate(ev.start_datetime)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function EmptyState({ categoryName }: { categoryName: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <CalendarX className="h-7 w-7 text-muted-foreground/50" />
      </div>
      <div>
        <p className="text-base font-bold text-foreground">
          No events in {categoryName}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Check back soon — new events are added regularly.
        </p>
      </div>
      <Link
        href="/events"
        className="mt-1 rounded-xl border border-border px-5 py-2 text-xs font-bold text-foreground transition hover:bg-muted"
      >
        Browse all events
      </Link>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

function CategoryDetails({ id }: { id: string }) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [sort, setSort] = useState<SortOption>("date_asc");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data: category, isLoading: catLoading } = useQuery({
    queryKey: ["category", id],
    queryFn: () => fetchCategory(id),
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: eventsLoading,
  } = useInfiniteQuery({
    queryKey: ["category-events", id, sort, debouncedSearch],
    queryFn: ({ pageParam }) =>
      fetchCategoryEvents({
        pageParam,
        categoryId: id,
        sort,
        search: debouncedSearch,
      }),
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

  const allEvents = data?.pages.flatMap((p) => p.results) ?? [];
  const totalCount = data?.pages[0]?.count ?? 0;
  const liveCount = allEvents.filter(
    (e) => statusFromDates(e.start_datetime, e.end_datetime) === "live",
  ).length;

  return (
    <div className="min-h-screen bg-background">
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      {catLoading ? (
        <HeroSkeleton />
      ) : (
        <header className="relative overflow-hidden border-b border-border">
          {category?.image ? (
            <>
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10" />
          )}

          <div className="container relative mx-auto px-4 pb-12 pt-10 sm:px-6">
            <Link
              href="/events"
              className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> All events
            </Link>

            <div className="flex flex-wrap items-end justify-between gap-6">
              {/* Text */}
              <div className="flex flex-col gap-3">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-primary">
                  <Tag className="h-3 w-3" /> Category
                </span>

                <h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                  {category?.name}
                </h1>

                {category?.description && (
                  <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                    {category.description}
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-3">
                <StatPill
                  icon={Calendar}
                  value={eventsLoading ? "—" : totalCount}
                  label="Total events"
                />
                {liveCount > 0 && (
                  <StatPill
                    icon={TrendingUp}
                    value={liveCount}
                    label="Live now"
                  />
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      <div className="container mx-auto px-4 sm:px-6">
        {/* ── FEATURED ─────────────────────────────────────────────────────── */}
        {!eventsLoading && allEvents.length >= 3 && (
          <FeaturedBanner events={allEvents} />
        )}

        {/* ── TOOLBAR ──────────────────────────────────────────────────────── */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5 pt-1">
          <p className="text-xs text-muted-foreground">
            {eventsLoading ? (
              <span className="inline-block h-3 w-36 animate-pulse rounded bg-muted" />
            ) : debouncedSearch ? (
              <>
                <span className="font-semibold text-foreground">
                  {allEvents.length}
                </span>{" "}
                result{allEvents.length !== 1 ? "s" : ""} for &ldquo;
                {debouncedSearch}&rdquo;
              </>
            ) : (
              <>
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {allEvents.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">
                  {totalCount}
                </span>{" "}
                events
              </>
            )}
          </p>

          <div className="flex items-center gap-2">
            <SearchBar value={search} onChange={setSearch} />
            <SortDropdown value={sort} onChange={setSort} />
          </div>
        </div>

        {/* ── GRID ─────────────────────────────────────────────────────────── */}
        <div className="py-6">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {eventsLoading &&
              Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <EventCardSkeleton key={i} />
              ))}

            {!eventsLoading && allEvents.length === 0 && (
              <div className="col-span-full">
                <EmptyState categoryName={category?.name ?? "this category"} />
              </div>
            )}

            {allEvents.map((ev, i) => (
              <EventCard key={ev.idx} event={ev} index={i} />
            ))}

            {isFetchingNextPage &&
              Array.from({ length: 4 }).map((_, i) => (
                <EventCardSkeleton key={`next-${i}`} />
              ))}
          </div>
        </div>

        {/* ── SENTINEL / END STATE ─────────────────────────────────────────── */}
        <div
          ref={sentinelRef}
          className="flex items-center justify-center py-8"
        >
          {isFetchingNextPage && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading more…
            </div>
          )}
          {!hasNextPage && allEvents.length > 0 && !eventsLoading && (
            <p className="text-xs text-muted-foreground">
              All {allEvents.length} events loaded ✓
            </p>
          )}
        </div>

        {/* ── BACK TO TOP ──────────────────────────────────────────────────── */}
        {allEvents.length > PAGE_SIZE && (
          <div className="flex justify-center pb-12">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="rounded-full border border-border bg-card px-5 py-2 text-xs font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              ↑ Back to top
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoryDetails;
