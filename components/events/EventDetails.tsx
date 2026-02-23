"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Globe,
  Heart,
  Images,
  MapPin,
  MousePointerClick,
  Share2,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import JoinEvent from "./JoinEvents";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { SINGLE_EVENT_QUERY_KEY } from "@/constants";
import { cn } from "@/lib/utils";

// ─── API TYPES ────────────────────────────────────────────────────────────────

type EventLocation = {
  idx: string;
  name: string;
  latitude: number;
  longitude: number;
};
type EventCategory = { idx: string; name: string };
type EventOrganizer = { idx: string; name: string; image: string | null };

type Event = {
  idx: string;
  title: string;
  description: string;
  start_datetime: string;
  end_datetime: string;
  location: EventLocation;
  is_paid: boolean;
  price: number;
  category: EventCategory;
  organizer: EventOrganizer;
  max_attendees: number;
  cover_image: string | null;
  duration: string;
};

type GalleryImage = { idx: string; image: string; caption?: string };

// ─── STATIC FALLBACKS (shown only when API field absent) ──────────────────────

const FALLBACK = {
  emoji: "🚀",
  rating: 4.8,
  reviews: 24,
  attendees: 42,
  groupStats: [
    ["48", "Events"],
    ["1.2K", "Members"],
    ["4.9", "Rating"],
  ],
  chartBars: [28, 45, 38, 72, 55, 88, 65, 91, 74, 85, 78, 95],
  relatedEvents: [
    {
      title: "Digital Marketing Masterclass",
      date: "Sun, Feb 23",
      attendees: 89,
      emoji: "📊",
    },
    {
      title: "Book Club: The Lean Startup",
      date: "Wed, Feb 19",
      attendees: 18,
      emoji: "📚",
    },
    {
      title: "Photography Walk: Thamel",
      date: "Sat, Feb 22",
      attendees: 23,
      emoji: "📸",
    },
  ],
  attendeeList: [
    { initials: "AK", name: "Aarav K.", role: "Founder", color: "primary" },
    { initials: "MJ", name: "Mina J.", role: "Designer", color: "secondary" },
    { initials: "SR", name: "Sita R.", role: "Developer", color: "accent" },
    { initials: "PB", name: "Prem B.", role: "Marketer", color: "primary" },
    { initials: "RC", name: "Ravi C.", role: "Investor", color: "secondary" },
    { initials: "DT", name: "Devi T.", role: "Mentor", color: "accent" },
  ],
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ─── SKELETON ────────────────────────────────────────────────────────────────

function Sk({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-xl bg-muted/70", className)} />
  );
}

// ─── GALLERY ─────────────────────────────────────────────────────────────────

function Gallery({ images }: { images: GalleryImage[] }) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  if (!images.length)
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-14 text-center">
        <Images className="h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No gallery images yet.</p>
      </div>
    );

  const [first, ...rest] = images;
  return (
    <>
      <div
        className={cn(
          "grid gap-2",
          images.length === 1
            ? "grid-cols-1"
            : images.length === 2
              ? "grid-cols-2"
              : "grid-cols-3",
        )}
      >
        <div
          className={cn(
            "relative cursor-zoom-in overflow-hidden rounded-2xl bg-muted",
            images.length >= 3 && "col-span-2",
          )}
          style={{ aspectRatio: images.length >= 3 ? "16/9" : "4/3" }}
          onClick={() => setLightbox(first.image)}
        >
          <Image
            src={first.image}
            alt={first.caption ?? "Photo"}
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
        {rest.map((img) => (
          <div
            key={img.idx}
            className="relative cursor-zoom-in overflow-hidden rounded-xl bg-muted"
            style={{ aspectRatio: "1/1" }}
            onClick={() => setLightbox(img.image)}
          >
            <Image
              src={img.image}
              alt={img.caption ?? "Photo"}
              fill
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
        ))}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
            onClick={() => setLightbox(null)}
          >
            ✕
          </button>
          <Image
            src={lightbox}
            alt="Preview"
            width={1200}
            height={800}
            className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}
    </>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function EventDetails({ eventId }: { eventId: string }) {
  const [liked, setLiked] = useState(false);
  const [joined, setJoined] = useState(false);
  const [tab, setTab] = useState<"about" | "stats" | "attendees" | "gallery">(
    "about",
  );
  const [showBar, setShowBar] = useState(false);
  const joinCardRef = useRef<HTMLDivElement>(null);

  // ── API queries ───────────────────────────────────────────────────────────
  const { data: event, isLoading } = useApiQuery<Event>({
    url: `/api/event/events/${eventId}/`,
    queryKey: SINGLE_EVENT_QUERY_KEY(eventId),
  });

  const { data: galleryData } = useApiQuery<{ results: GalleryImage[] }>({
    url: `/api/event/events/${eventId}/images/`,
    queryKey: ["event", "gallery", eventId],
  });

  const gallery: GalleryImage[] = galleryData?.results ?? [];

  // ── Derived display values — real data first, fallback second ─────────────
  const title = event?.title ?? "Loading…";
  const description = event?.description ?? "";
  const category = event?.category?.name ?? "";
  const locationName = event?.location?.name ?? "";
  const lat = event?.location?.latitude;
  const lng = event?.location?.longitude;
  const startDate = event?.start_datetime
    ? formatDate(event.start_datetime)
    : "—";
  const startTime = event?.start_datetime
    ? formatTime(event.start_datetime)
    : "—";
  const endTime = event?.end_datetime ? formatTime(event.end_datetime) : "—";
  const timeRange = `${startTime} – ${endTime}`;
  const organizer = event?.organizer?.name ?? "";
  const organizerImg = event?.organizer?.image ?? null;
  const maxAttendees = event?.max_attendees ?? 0;
  const isPaid = event?.is_paid ?? false;
  const price = event?.price ?? 0;
  const coverImage = event?.cover_image ?? null;

  // ── Sticky bar via IntersectionObserver ───────────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => setShowBar(!e.isIntersecting),
      { threshold: 0 },
    );
    if (joinCardRef.current) observer.observe(joinCardRef.current);
    return () => observer.disconnect();
  }, []);

  const TABS = ["about", "stats", "attendees", "gallery"] as const;

  if (!event) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* NAV */}
      <nav
        className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md"
        style={{ animation: "dp 0.4s ease both" }}
      >
        <div className="container mx-auto flex items-center justify-between px-6 py-3.5">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Events
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLiked(!liked)}
              className={cn(
                "ib flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card transition-all",
                liked ? "border-red-300 text-red-500" : "text-muted-foreground",
              )}
            >
              <Heart className={cn("h-3.5 w-3.5", liked && "fill-red-500")} />
            </button>
            <button className="ib flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-all">
              <Share2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* ── LEFT ───────────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-8">
            {/* Hero */}
            <div
              className="relative flex h-56 items-center justify-center overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/8 via-muted to-secondary/8 md:h-72"
              style={{ animation: "du 0.55s ease 0.05s both" }}
            >
              {coverImage ? (
                <Image
                  src={coverImage}
                  alt={title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <>
                  <div
                    className="absolute inset-0 opacity-[0.05]"
                    style={{
                      backgroundImage:
                        "radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)",
                      backgroundSize: "24px 24px",
                    }}
                  />
                  <span className="hero-em select-none text-[130px] md:text-[160px]">
                    {FALLBACK.emoji}
                  </span>
                </>
              )}
              <div className="absolute left-4 top-4 flex gap-2">
                {category && (
                  <span className="rounded-full border border-border bg-card/80 px-3 py-1 text-[11px] font-semibold text-foreground backdrop-blur-sm">
                    {category}
                  </span>
                )}
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-[11px] font-semibold backdrop-blur-sm",
                    isPaid
                      ? "bg-accent/80 text-accent-foreground"
                      : "bg-secondary/80 text-secondary-foreground",
                  )}
                >
                  {isPaid ? `NPR ${price.toLocaleString()}` : "Free"}
                </span>
              </div>
            </div>

            {/* Title block */}
            <div style={{ animation: "du 0.55s ease 0.12s both" }}>
              {isLoading ? (
                <div className="flex flex-col gap-3">
                  <Sk className="h-8 w-3/4" />
                  <Sk className="h-4 w-48" />
                  <Sk className="h-4 w-64" />
                </div>
              ) : (
                <>
                  <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                    {title}
                  </h1>
                  <div className="mt-3 flex flex-wrap gap-4">
                    {[
                      {
                        icon: Calendar,
                        text: startDate,
                        color: "text-primary",
                      },
                      { icon: Clock, text: timeRange, color: "text-secondary" },
                      {
                        icon: MapPin,
                        text: locationName,
                        color: "text-accent",
                      },
                    ]
                      .filter((r) => r.text && r.text !== "—")
                      .map(({ icon: Icon, text, color }) => (
                        <span
                          key={text}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground"
                        >
                          <Icon className={cn("h-3.5 w-3.5", color)} />
                          {text}
                        </span>
                      ))}
                  </div>
                  <div className="mt-2.5 flex items-center gap-1.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3.5 w-3.5",
                          i < Math.floor(FALLBACK.rating)
                            ? "fill-accent text-accent"
                            : "text-border",
                        )}
                      />
                    ))}
                    <span className="text-xs font-semibold text-foreground">
                      {FALLBACK.rating}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({FALLBACK.reviews})
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Tabs */}
            <div style={{ animation: "du 0.55s ease 0.19s both" }}>
              <div className="flex gap-0.5 rounded-xl border border-border bg-muted p-1">
                {TABS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={cn(
                      "flex-1 rounded-lg py-1.5 text-xs font-semibold capitalize transition-all",
                      tab === t
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* ── ABOUT ── */}
              {tab === "about" && (
                <div className="tc mt-5 flex flex-col gap-4">
                  {description ? (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {description}
                    </p>
                  ) : (
                    <p className="text-sm italic text-muted-foreground/50">
                      No description provided.
                    </p>
                  )}

                  {/* Organizer */}
                  {organizer && (
                    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                      {organizerImg ? (
                        <Image
                          src={organizerImg}
                          alt={organizer}
                          width={40}
                          height={40}
                          className="h-10 w-10 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {initials(organizer)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          {organizer}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          Organizer
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-auto h-7 shrink-0 rounded-full px-3 text-xs"
                      >
                        Follow
                      </Button>
                    </div>
                  )}

                  {/* Location */}
                  {locationName && (
                    <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {locationName}
                        </p>
                        {lat != null && lng != null && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {lat.toFixed(4)}, {lng.toFixed(4)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Capacity */}
                  {maxAttendees > 0 && (
                    <div className="rounded-2xl border border-border bg-card p-4">
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground">
                          Capacity
                        </span>
                        <span className="text-muted-foreground">
                          {FALLBACK.attendees}/{maxAttendees} joined
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="pb h-full rounded-full bg-primary"
                          style={{
                            width: `${Math.min((FALLBACK.attendees / maxAttendees) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── STATS ── */}
              {tab === "stats" && (
                <div className="tc mt-5 flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {[
                      {
                        icon: Eye,
                        label: "Views",
                        value: "1,240",
                        color: "text-primary",
                        bg: "bg-primary/10",
                      },
                      {
                        icon: MousePointerClick,
                        label: "Clicks",
                        value: "387",
                        color: "text-secondary",
                        bg: "bg-secondary/10",
                      },
                      {
                        icon: Users,
                        label: "Leads",
                        value: "42",
                        color: "text-accent",
                        bg: "bg-accent/10",
                      },
                      {
                        icon: TrendingUp,
                        label: "Conversion",
                        value: "3.4%",
                        color: "text-primary",
                        bg: "bg-primary/10",
                      },
                    ].map((s, i) => (
                      <div
                        key={s.label}
                        className="sc flex flex-col gap-2.5 rounded-2xl border border-border bg-card p-4"
                        style={{ animationDelay: `${i * 0.06}s` }}
                      >
                        <div
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-lg",
                            s.bg,
                            s.color,
                          )}
                        >
                          <s.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xl font-bold text-foreground">
                            {s.value}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {s.label}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Views · Last 12 months
                    </p>
                    <div className="flex h-20 items-end gap-1">
                      {FALLBACK.chartBars.map((h, i) => (
                        <div
                          key={i}
                          className="flex flex-1 flex-col justify-end"
                        >
                          <div
                            className="w-full rounded-t-sm bg-primary/12"
                            style={{ height: `${h}%` }}
                          >
                            <div
                              className="bc w-full rounded-t-sm bg-primary"
                              style={{
                                height: "70%",
                                animationDelay: `${i * 0.04}s`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
                      <span>Jan</span>
                      <span>Jun</span>
                      <span>Now</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── ATTENDEES ── */}
              {tab === "attendees" && (
                <div className="tc mt-5 flex flex-col gap-2">
                  {FALLBACK.attendeeList.map((a, i) => (
                    <div
                      key={a.name}
                      className="ac flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-primary-foreground"
                        style={{ background: `hsl(var(--${a.color}))` }}
                      >
                        {a.initials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {a.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {a.role}
                        </p>
                      </div>
                      <CheckCircle2 className="ml-auto h-4 w-4 text-secondary" />
                    </div>
                  ))}
                </div>
              )}

              {/* ── GALLERY ── */}
              {tab === "gallery" && (
                <div className="tc mt-5">
                  <Gallery images={gallery} />
                </div>
              )}
            </div>

            {/* Inline gallery preview on About tab */}
            {tab === "about" && gallery.length > 0 && (
              <div style={{ animation: "du 0.55s ease 0.23s both" }}>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Images className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-bold text-foreground">Gallery</p>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      {gallery.length}
                    </span>
                  </div>
                  {gallery.length > 4 && (
                    <button
                      onClick={() => setTab("gallery")}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      See all
                    </button>
                  )}
                </div>
                <Gallery images={gallery.slice(0, 4)} />
              </div>
            )}

            {/* Related */}
            <div style={{ animation: "du 0.55s ease 0.26s both" }}>
              <p className="mb-4 text-sm font-bold text-foreground">
                You might also like
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {FALLBACK.relatedEvents.map((ev, i) => (
                  <Link
                    key={ev.title}
                    href="#"
                    className="rc group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/30 hover:shadow-md"
                    style={{ animationDelay: `${i * 0.07}s` }}
                  >
                    <div className="flex h-16 items-center justify-center bg-muted text-3xl">
                      {ev.emoji}
                    </div>
                    <div className="px-3 py-2.5">
                      <p className="line-clamp-2 text-xs font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                        {ev.title}
                      </p>
                      <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {ev.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {ev.attendees}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ── SIDEBAR ────────────────────────────────────────────────────── */}
          <div
            className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start"
            style={{ animation: "du 0.55s ease 0.16s both" }}
          >
            <div ref={joinCardRef}>
              <JoinEvent event={event} />
            </div>

            {/* Organizer card */}
            {organizer && (
              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Organized by
                </p>
                <div className="flex items-center gap-3">
                  {organizerImg ? (
                    <Image
                      src={organizerImg}
                      alt={organizer}
                      width={40}
                      height={40}
                      className="h-10 w-10 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {initials(organizer)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {organizer}
                    </p>
                    <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Globe className="h-3 w-3" /> Public group
                    </p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  {FALLBACK.groupStats.map(([val, lbl]) => (
                    <div key={lbl} className="rounded-lg bg-muted/60 py-2">
                      <p className="text-sm font-bold text-foreground">{val}</p>
                      <p className="text-[10px] text-muted-foreground">{lbl}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Share */}
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="mb-3 text-xs font-semibold text-foreground">
                Share
              </p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  ["𝕏", "X"],
                  ["in", "LinkedIn"],
                  ["f", "Facebook"],
                  ["🔗", "Copy"],
                ].map(([icon, lbl]) => (
                  <button
                    key={lbl}
                    className="sb flex flex-col items-center gap-1 rounded-xl border border-border bg-muted py-2.5 text-xs font-bold text-muted-foreground transition-all hover:border-primary/30 hover:text-primary"
                  >
                    <span className="text-sm">{icon}</span>
                    <span className="text-[9px]">{lbl}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── STICKY BOTTOM BAR ─────────────────────────────────────────────── */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.34,1.3,0.64,1)]",
          showBar
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0 pointer-events-none",
        )}
      >
        <div className="border-t border-border bg-card/90 shadow-[0_-8px_40px_-4px_hsl(var(--foreground)/0.1)] backdrop-blur-xl">
          <div className="h-[2px] bg-gradient-to-r from-primary via-secondary to-accent" />
          <div className="container mx-auto px-6 py-3">
            <div className="flex items-center gap-3 md:gap-5">
              {/* Cover or emoji */}
              <div className="flex shrink-0 items-center gap-3">
                {coverImage ? (
                  <Image
                    src={coverImage}
                    alt={title}
                    width={32}
                    height={32}
                    className="h-8 w-8 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <span className="text-2xl leading-none">
                    {FALLBACK.emoji}
                  </span>
                )}
                <div className="hidden min-w-0 sm:block">
                  <p className="truncate text-sm font-bold leading-tight text-foreground">
                    {title}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {isPaid ? `NPR ${price.toLocaleString()}` : "Free"}
                    {maxAttendees > 0 && ` · ${maxAttendees} seats`}
                  </p>
                </div>
              </div>

              <div className="hidden h-8 w-px shrink-0 bg-border sm:block" />

              {/* Pills */}
              <div className="flex flex-1 flex-wrap items-center gap-2">
                {[
                  {
                    icon: Calendar,
                    text: startDate,
                    color: "text-primary",
                    delay: "0.06s",
                  },
                  {
                    icon: Clock,
                    text: timeRange,
                    color: "text-secondary",
                    delay: "0.13s",
                  },
                  {
                    icon: MapPin,
                    text: locationName,
                    color: "text-accent",
                    delay: "0.20s",
                    hide: true,
                  },
                ]
                  .filter((p) => p.text && p.text !== "—")
                  .map(({ icon: Icon, text, color, delay, hide }) => (
                    <span
                      key={text}
                      className={cn(
                        "flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-muted px-3 py-1.5 text-[11px] font-medium text-foreground",
                        hide && "hidden md:flex",
                        showBar && "pill-in",
                      )}
                      style={{ animationDelay: delay }}
                    >
                      <Icon className={cn("h-3 w-3 shrink-0", color)} />
                      {text}
                    </span>
                  ))}
              </div>

              {/* CTA */}
              <button
                onClick={() => setJoined(!joined)}
                className={cn(
                  "bar-btn flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold",
                  joined
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-primary text-primary-foreground",
                )}
              >
                {joined ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Joined
                  </>
                ) : (
                  <>
                    Join <ArrowRight className="bar-arrow h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showBar && <div className="h-20" />}

      <style>{`
        @keyframes du  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
        @keyframes dp  { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:none} }
        @keyframes pip { from{opacity:0;transform:translateY(6px)}  to{opacity:1;transform:none} }

        .hero-em { animation: hf 5s ease-in-out infinite; }
        @keyframes hf { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-12px) rotate(2deg)} }

        .tc { animation: du 0.3s ease both; }
        .sc { animation: du 0.4s ease both; transition: transform .2s ease, box-shadow .2s ease; }
        .sc:hover { transform: translateY(-3px); box-shadow: 0 8px 20px -4px hsl(var(--foreground)/.07); }
        .bc { animation: bcg 0.7s ease both; }
        @keyframes bcg { from{height:0} to{height:70%} }
        .ac { animation: du 0.35s ease both; transition: transform .18s ease; }
        .ac:hover { transform: translateX(3px); }
        .rc { animation: du 0.4s ease both; }
        .pb { animation: pbg 1s cubic-bezier(.34,1.2,.64,1) .5s both; }
        @keyframes pbg { from{width:0} }

        .ib { transition: transform .2s cubic-bezier(.34,1.56,.64,1); }
        .ib:hover { transform: scale(1.12); }
        .sb { transition: transform .2s cubic-bezier(.34,1.56,.64,1); }
        .sb:hover { transform: translateY(-2px); }
        .pill-in { animation: pip 0.4s ease both; }
        .bar-btn { transition: transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .2s ease; }
        .bar-btn:hover { transform: translateY(-1px) scale(1.02); box-shadow: 0 8px 20px -4px hsl(var(--primary)/.35); }
        .bar-arrow { transition: transform .18s ease; }
        .bar-btn:hover .bar-arrow { transform: translateX(3px); }
      `}</style>
    </div>
  );
}
