"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Ticket,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { PaginatedAPIResponse } from "@/lib/types";

// ─── QUERY KEY ───────────────────────────────────────────────────────────────

export const JOINED_EVENTS_QUERY_KEY = ["events", "joined"];

// ─── TYPES ───────────────────────────────────────────────────────────────────

// API returns flat Event objects directly (not nested under .event)
type JoinedEvent = {
  idx: string;
  title: string;
  description: string;
  start_datetime: string;
  end_datetime: string;
  location: {
    idx: string;
    name: string;
    latitude: number;
    longitude: number;
  } | null;
  is_paid: boolean;
  price: number;
  category: { idx: string; name: string } | null;
  organizer: { idx: string; name: string; image: string | null } | null;
  max_attendees: number;
  joined_attendees: number;
  cover_image: string | null;
  duration: string;
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

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

// ─── ATTENDEES BADGE ─────────────────────────────────────────────────────────

function AttendeesBadge({ joined, max }: { joined: number; max: number }) {
  const isFull = max > 0 && joined >= max;
  const unlimited = max === 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        isFull
          ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30"
          : "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/30",
      )}
    >
      <Users className="h-3 w-3" />
      {unlimited ? `${joined} joined` : `${joined} / ${max}`}
    </span>
  );
}

// ─── SKELETON ────────────────────────────────────────────────────────────────

function RowSkeleton() {
  return (
    <tr className="border-b border-border">
      {[60, 45, 50, 50, 40, 25].map((w, i) => (
        <td key={i} className="px-6 py-4">
          <div
            className="h-4 animate-pulse rounded-md bg-muted/70"
            style={{ width: `${w}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

// ─── EMPTY STATE ─────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <tr>
      <td colSpan={6} className="px-6 py-20 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <Ticket className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-heading text-base font-semibold text-foreground">
              No events joined yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Events you join will appear here.
            </p>
          </div>
          <Link
            href="/find"
            className="mt-1 rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
          >
            Browse events
          </Link>
        </div>
      </td>
    </tr>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

const JoinedEventsOverview = () => {
  const { data, isLoading } = useApiQuery<PaginatedAPIResponse<JoinedEvent>>({
    url: "/api/event/events/joined-events/",
    queryKey: JOINED_EVENTS_QUERY_KEY,
  });

  const events = data?.results ?? [];

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalJoined = events.length;
  const upcoming = events.filter(
    (e) => e.start_datetime && new Date(e.start_datetime) > new Date(),
  ).length;
  const totalAttendees = events.reduce(
    (s, e) => s + (e.joined_attendees ?? 0),
    0,
  );
  const paidEvents = events.filter((e) => e.is_paid).length;

  const statCards = [
    {
      label: "Total joined",
      value: totalJoined,
      icon: Ticket,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Upcoming",
      value: upcoming,
      icon: Calendar,
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
    {
      label: "Total attendees",
      value: totalAttendees,
      icon: Users,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: "Paid events",
      value: paidEvents,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50 dark:bg-green-950/30",
    },
  ] as const;

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
          My Events
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Events you've registered for.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-5"
          >
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",
                s.bg,
              )}
            >
              <s.icon className={cn("h-5 w-5", s.color)} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold text-foreground">
                {isLoading ? (
                  <span className="inline-block h-7 w-8 animate-pulse rounded-md bg-muted/70" />
                ) : (
                  s.value
                )}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <h3 className="text-sm font-semibold text-foreground">
            All registrations
          </h3>
          <p className="text-xs text-muted-foreground">
            {isLoading
              ? "Loading…"
              : `${totalJoined} event${totalJoined !== 1 ? "s" : ""}`}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3">Event</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3">Organizer</th>
                <th className="px-6 py-3">Attendees</th>
                <th className="px-6 py-3 text-right">Entry</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)
              ) : events.length === 0 ? (
                <EmptyState />
              ) : (
                events.map((ev) => (
                  <tr
                    key={ev.idx}
                    className="border-b border-border last:border-0 transition-colors hover:bg-muted/30"
                  >
                    {/* Event */}
                    <td className="px-6 py-4">
                      <Link
                        href={`/events/${ev.idx}`}
                        className="group flex items-center gap-3"
                      >
                        {ev.cover_image ? (
                          <Image
                            src={ev.cover_image}
                            alt={ev.title}
                            width={40}
                            height={40}
                            className="h-10 w-10 shrink-0 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-lg">
                            🎟️
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                            {ev.title}
                          </p>
                          {ev.category?.name && (
                            <p className="text-xs text-muted-foreground">
                              {ev.category.name}
                            </p>
                          )}
                        </div>
                      </Link>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4">
                      {ev.start_datetime ? (
                        <>
                          <p className="flex items-center gap-1.5 text-sm text-foreground">
                            <Calendar className="h-3.5 w-3.5 shrink-0 text-primary" />
                            {formatDate(ev.start_datetime)}
                          </p>
                          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 shrink-0" />
                            {formatTime(ev.start_datetime)}
                          </p>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>

                    {/* Location */}
                    <td className="max-w-[160px] px-6 py-4">
                      {ev.location?.name ? (
                        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-accent" />
                          <span className="line-clamp-1">
                            {ev.location.name}
                          </span>
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>

                    {/* Organizer */}
                    <td className="px-6 py-4">
                      {ev.organizer?.name ? (
                        <p className="text-sm text-muted-foreground">
                          {ev.organizer.name}
                        </p>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>

                    {/* Attendees */}
                    <td className="px-6 py-4">
                      <AttendeesBadge
                        joined={ev.joined_attendees ?? 0}
                        max={ev.max_attendees ?? 0}
                      />
                    </td>

                    {/* Entry */}
                    <td className="px-6 py-4 text-right">
                      {ev.is_paid ? (
                        <span className="text-sm font-semibold text-foreground">
                          NPR {ev.price?.toLocaleString()}
                        </span>
                      ) : (
                        <span className="rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-semibold text-secondary">
                          Free
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JoinedEventsOverview;
