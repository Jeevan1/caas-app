"use client";

import { cn } from "@/lib/utils";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { EVENT_DETAILS_QUERY_KEY, EVENT_SUMMARY_QUERY_KEY } from "@/constants";
import { useCurrentUser } from "@/lib/providers";
import { hasPermission } from "@/lib/permissions/has-permissions";
import { redirect, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { Event, EventSummary } from "@/lib/types";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Users,
  Tag,
  Ticket,
  Globe,
  BadgeCheck,
  User,
  Pen,
  Pencil,
} from "lucide-react";
import { Section } from "../section";
import EventGallery from "../events/EventGallery";
import Image from "next/image";
import { Button } from "../ui/button";
import { EventForm } from "./GalleryForm";
import { useState } from "react";

// ─── Skeleton primitives ──────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
}

function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-2">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-7 w-12" />
      <Skeleton className="h-2.5 w-16" />
    </div>
  );
}

function PanelSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3">
      <Skeleton className="h-3 w-28" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-8" />
        </div>
      ))}
      <div className="border-t border-border pt-3 flex flex-col gap-1.5">
        <div className="flex justify-between">
          <Skeleton className="h-2.5 w-20" />
          <Skeleton className="h-2.5 w-8" />
        </div>
        <Skeleton className="h-1.5 w-full" />
      </div>
    </div>
  );
}

function EventDetailSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-5 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_MAP: Record<number, { label: string; className: string }> = {
  0: { label: "Draft", className: "bg-muted text-muted-foreground" },
  1: {
    label: "Published",
    className:
      "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400",
  },
  2: {
    label: "Active",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  },
  3: {
    label: "Ended",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  },
  4: {
    label: "Cancelled",
    className: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  },
};

function formatDuration(seconds: string) {
  const s = parseFloat(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function EventsSummaryOverview({ id }: { id: string }) {
  const user = useCurrentUser();
  const locale = useLocale();
  const router = useRouter();

  if (!hasPermission(user, ["events-summary:get"])) {
    redirect({ href: "/dashboard", locale });
  }
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading } = useApiQuery<EventSummary>({
    url: `/api/event/events/${id}/summary`,
    queryKey: EVENT_SUMMARY_QUERY_KEY(id),
    enabled: !!id,
  });

  const { data: event, isLoading: isEventLoading } = useApiQuery<Event>({
    url: `/api/event/events/${id}`,
    queryKey: EVENT_DETAILS_QUERY_KEY(id),
    enabled: !!id,
  });

  const capacityPct = data?.max_attendees
    ? Math.round((data.total_attendees / data.max_attendees) * 100)
    : 0;

  const revenuePct = data?.potential_revenue
    ? Math.round((data.confirmed_revenue / data.potential_revenue) * 100)
    : 0;

  const statusCfg = STATUS_MAP[event?.status ?? 0] ?? STATUS_MAP[0];

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      {/* ── Header ── */}
      <div className="flex gap-4 justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Event summary
          </p>
          {isEventLoading ? (
            <>
              <Skeleton className="h-8 w-64 mt-1" />
              <Skeleton className="h-4 w-40 mt-2" />
            </>
          ) : (
            <>
              <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
                {event?.title ?? "Untitled event"}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                {event?.location && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {event.location.name}
                  </span>
                )}
                {event?.start_datetime && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(event.start_datetime).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      },
                    )}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors w-fit mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          Back to events
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))
          : [
              {
                label: "Total clicks",
                value: data?.total_clicks ?? 0,
                sub: "Link visits",
              },
              {
                label: "Total attendees",
                value: data?.total_attendees ?? 0,
                sub: `of ${data?.max_attendees ?? 0} max`,
              },
              {
                label: "Favorites",
                value: data?.total_favorites ?? 0,
                sub: "Saved by users",
              },
              {
                label: "Spots left",
                value: data?.spots_left ?? 0,
                sub: "Available seats",
                green: true,
              },
            ].map((s, i) => (
              <Section
                delay={i * 0.1}
                key={s.label}
                className="rounded-xl border border-border bg-card p-5"
              >
                <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                <p
                  className={cn(
                    "text-2xl font-bold",
                    s.green ? "text-green-600" : "text-foreground",
                  )}
                >
                  {s.value}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">{s.sub}</p>
              </Section>
            ))}
      </div>

      {/* ── Bottom panels ── */}
      <div className="grid gap-3 sm:grid-cols-2">
        {isLoading ? (
          <>
            <PanelSkeleton />
            <PanelSkeleton />
          </>
        ) : (
          <>
            <Section
              delay={0.2}
              className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3"
            >
              <p className="text-xs font-medium text-muted-foreground">
                Attendee breakdown
              </p>
              {[
                { label: "Joined", value: data?.joined_attendees ?? 0 },
                { label: "Pending", value: data?.pending_attendees ?? 0 },
                { label: "Registered", value: data?.total_attendees ?? 0 },
              ].map((r) => (
                <div
                  key={r.label}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-muted-foreground">
                    {r.label}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {r.value}
                  </span>
                </div>
              ))}
              <div className="border-t border-border pt-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Capacity used</span>
                  <span>{capacityPct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${capacityPct}%` }}
                  />
                </div>
              </div>
            </Section>

            <Section
              delay={0.3}
              className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3"
            >
              <p className="text-xs font-medium text-muted-foreground">
                Revenue
              </p>
              {[
                {
                  label: "Potential",
                  value: `Rs ${(data?.potential_revenue ?? 0).toLocaleString()}`,
                },
                {
                  label: "Confirmed",
                  value: `Rs ${(data?.confirmed_revenue ?? 0).toLocaleString()}`,
                  green: true,
                },
              ].map((r) => (
                <div
                  key={r.label}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-muted-foreground">
                    {r.label}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      r.green ? "text-green-600" : "text-foreground",
                    )}
                  >
                    {r.value}
                  </span>
                </div>
              ))}
              <div className="border-t border-border pt-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Collection rate</span>
                  <span>{revenuePct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all duration-500"
                    style={{ width: `${revenuePct}%` }}
                  />
                </div>
              </div>
            </Section>
          </>
        )}
      </div>
      {/* ── Event detail card ── */}
      <Section delay={0.4} className="flex justify-between items-center gap-4">
        <p className="text-md font-medium text-muted-foreground">
          Event details
        </p>
        <Button size="sm" variant="default" onClick={() => setDialogOpen(true)}>
          <Pencil /> Edit event
        </Button>
      </Section>
      {isEventLoading ? (
        <EventDetailSkeleton />
      ) : (
        <Section
          delay={0.4}
          className="rounded-xl border border-border bg-card overflow-hidden grid grid-cols-1 md:grid-cols-2"
        >
          {/* Cover image */}
          {event?.cover_image && (
            <div className="relative h-full w-full overflow-hidden bg-background">
              <Image
                src={event.cover_image}
                alt={event.title}
                fill
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
              <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                <h1 className="font-heading text-xl font-bold text-foreground md:text-2xl line-clamp-1">
                  {event?.title}
                </h1>
                <span
                  className={cn(
                    "shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ml-3",
                    statusCfg.className,
                  )}
                >
                  {statusCfg.label}
                </span>
              </div>
            </div>
          )}

          <div className="p-5 flex flex-col gap-5">
            {/* Title fallback if no cover */}
            {!event?.cover_image && (
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground tracking-wider mb-1">
                    Event summary
                  </p>
                  <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
                    {event?.title ?? "Untitled event"}
                  </h1>
                </div>
                <span
                  className={cn(
                    "shrink-0 text-xs font-medium px-2.5 py-1 rounded-full mt-1",
                    statusCfg.className,
                  )}
                >
                  {statusCfg.label}
                </span>
              </div>
            )}

            {/* Meta grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              {[
                {
                  icon: Calendar,
                  label: "Date",
                  value: event?.start_datetime
                    ? new Date(event.start_datetime).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )
                    : null,
                },
                {
                  icon: Clock,
                  label: "Duration",
                  value: event?.duration
                    ? formatDuration(event.duration)
                    : null,
                },
                {
                  icon: MapPin,
                  label: "Location",
                  value: event?.location?.name ?? null,
                },
                {
                  icon: Users,
                  label: "Capacity",
                  value: event?.max_attendees
                    ? `${event.max_attendees} attendees`
                    : null,
                },
                {
                  icon: Ticket,
                  label: "Price",
                  value: event?.is_paid
                    ? `Rs ${event.price?.toLocaleString()}`
                    : "Free",
                },
                {
                  icon: Tag,
                  label: "Category",
                  value: event?.category?.name ?? null,
                },
                {
                  icon: Globe,
                  label: "Format",
                  value: event?.is_online ? "Online" : "In-person",
                },
                {
                  icon: User,
                  label: "Organizer",
                  value: event?.organizer?.name ?? null,
                },
              ]
                .filter((r) => r.value !== null)
                .map((r) => (
                  <div key={r.label} className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <r.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">{r.label}</p>
                      <p className="text-sm font-medium text-foreground truncate">
                        {r.value}
                      </p>
                    </div>
                  </div>
                ))}
            </div>

            {/* Tags */}
            {event?.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1 border-t border-border">
                {event.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Organizer mini profile */}
            {event?.organizer && (
              <div className="flex items-center gap-3 pt-1 border-t border-border">
                {event.organizer.image ? (
                  <img
                    src={event.organizer.image}
                    alt={event.organizer.name}
                    className="h-9 w-9 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-sm font-bold text-muted-foreground">
                    {event.organizer.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-foreground flex items-center gap-1">
                    {event.organizer.name}
                    <BadgeCheck className="h-3.5 w-3.5 text-blue-500" />
                  </p>
                </div>
              </div>
            )}
          </div>
        </Section>
      )}
      <Section delay={0.4} className="col-span-1 sm:col-span-2">
        <p className="text-md  font-medium text-muted-foreground pb-2">
          Gallery
        </p>
        <EventGallery
          eventId={id}
          className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-7"
        />
      </Section>
      {event && (
        <EventForm
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          editing={event}
          initialStep={"event"}
        />
      )}
    </div>
  );
}
