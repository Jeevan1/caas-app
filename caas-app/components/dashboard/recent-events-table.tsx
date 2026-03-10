"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { EVENTS_QUERY_KEY } from "@/constants";
import { PaginatedAPIResponse, Event } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Users,
  Eye,
  MousePointerClick,
  ArrowUpRight,
} from "lucide-react";
import { formatDate } from "@/lib/helpers";

function fmtNum(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

function getEventStatus(
  start: string,
  end: string,
): "upcoming" | "live" | "ended" {
  const now = Date.now();
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (now < s) return "upcoming";
  if (now > e) return "ended";
  return "live";
}

const STATUS_STYLES = {
  live: "bg-secondary/10 text-secondary border-secondary/20",
  upcoming: "bg-primary/10 text-primary border-primary/20",
  ended: "bg-muted text-muted-foreground border-border",
};

const STATUS_LABELS = { live: "Live", upcoming: "Upcoming", ended: "Ended" };

// ─── SKELETON ────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-border last:border-0">
          <td className="px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
              <div className="flex flex-col gap-1.5">
                <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                <div className="h-2.5 w-20 animate-pulse rounded bg-muted/60" />
              </div>
            </div>
          </td>
          {Array.from({ length: 5 }).map((_, j) => (
            <td key={j} className="px-5 py-3.5">
              <div className="h-3 w-16 animate-pulse rounded bg-muted" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export function RecentEventsTable() {
  const { data, isLoading } = useApiQuery<PaginatedAPIResponse<Event>>({
    url: `/api/event/events/my-events/`,
    queryKey: EVENTS_QUERY_KEY,
    queryParams: { limit: 5, page: 1, sort: "createdAt:desc" },
  });

  const events = data?.results ?? [];

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card lg:col-span-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Recent Events
          </h3>
          <p className="text-xs text-muted-foreground">
            Manage and track your events
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          asChild
          className="rounded-lg text-xs"
        >
          <Link href="/dashboard/events">View all</Link>
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px]">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left">
              {[
                "Event",
                "Category",
                "Date",
                "Status",
                "Attendees",
                "Views",
                "Clicks",
              ].map((h, i) => (
                <th
                  key={h}
                  className={cn(
                    "px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground",
                    i >= 4 && "text-right",
                  )}
                >
                  {h}
                </th>
              ))}
              <th className="px-5 py-3" />
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <TableSkeleton />
            ) : events.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-5 py-12 text-center text-sm text-muted-foreground"
                >
                  No events yet.{" "}
                  <Link
                    href="/dashboard/events"
                    className="font-semibold text-primary hover:underline"
                  >
                    Create your first event →
                  </Link>
                </td>
              </tr>
            ) : (
              events.map((event, idx) => {
                const status = getEventStatus(
                  event.start_datetime,
                  event.end_datetime,
                );
                const isPaid = event.is_paid;
                const views = (event as any).total_views ?? 0;
                const clicks = (event as any).total_clicks ?? 0;
                const initials =
                  event.organizer?.name?.charAt(0).toUpperCase() ?? "E";

                return (
                  <tr
                    key={event.idx}
                    className={cn(
                      "group border-b border-border last:border-0 transition-colors hover:bg-muted/30",
                    )}
                  >
                    {/* Event name + cover */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {/* Cover thumbnail */}
                        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                          {event.cover_image ? (
                            <Image
                              src={event.cover_image}
                              alt={event.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-primary/8 text-base">
                              🎯
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground max-w-[180px]">
                            {event.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {isPaid
                              ? `NPR ${Number(event.price).toLocaleString()}`
                              : "Free"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-muted-foreground">
                        {event.category?.name ?? "—"}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 shrink-0 text-primary/60" />
                        {formatDate(event.start_datetime)}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                          STATUS_STYLES[status],
                        )}
                      >
                        {status === "live" && (
                          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
                        )}
                        {STATUS_LABELS[status]}
                      </span>
                    </td>

                    {/* Attendees */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Users className="h-3 w-3 text-muted-foreground/60" />
                        <span className="text-sm font-medium text-foreground">
                          {fmtNum(event.total_attendees ?? 0)}
                        </span>
                      </div>
                    </td>

                    {/* Views */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Eye className="h-3 w-3 text-muted-foreground/60" />
                        <span className="text-sm text-foreground">
                          {fmtNum(views)}
                        </span>
                      </div>
                    </td>

                    {/* Clicks */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <MousePointerClick className="h-3 w-3 text-muted-foreground/60" />
                        <span className="text-sm text-foreground">
                          {fmtNum(clicks)}
                        </span>
                      </div>
                    </td>

                    {/* Row action */}
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/dashboard/events/${event.idx}`}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-card opacity-0 transition-all group-hover:opacity-100 hover:bg-muted"
                      >
                        <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
