"use client";

import { useState } from "react";
import { z } from "zod";
import { Plus, Pencil, CheckCircle2, Calendar, Users } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { EVENTS_QUERY_KEY } from "@/constants";
import { Event, PaginatedAPIResponse } from "@/lib/types";
import { DeleteAlertDialog } from "../DeleteAlertDialog";
import { EventForm } from "./GalleryForm";
import { statusFromDates } from "@/lib/helpers";

// ─── SCHEMA ──────────────────────────────────────────────────────────────────

const locationSchema = z.object({
  name: z.string().min(1, "Location is required"),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
});

const eventSchema = z.object({
  title: z.string().min(1, "Title is required").min(2, "At least 2 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(1000, "Max 1000 characters"),
  category: z.string().min(1, "Category is required"),
  start_datetime: z.string().min(1, "Start date & time is required"),
  end_datetime: z.string().min(1, "End date & time is required"),
  location: locationSchema,
  is_paid: z.boolean(),
  price: z.string().optional(),
  max_attendees: z.string().regex(/^\d+$/, "Must be a number"),
  cover_image: z
    .instanceof(File)
    .refine((f) => f.size <= 5 * 1024 * 1024, "Max 5 MB")
    .optional(),
  tags: z.string().optional(),
});

type EventValues = z.infer<typeof eventSchema>;

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

export function EventsOverview() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);

  const { data, isLoading } = useApiQuery<PaginatedAPIResponse<Event>>({
    url: "/api/event/events/my-events",
    queryKey: EVENTS_QUERY_KEY,
  });

  const events = data?.results ?? [];

  const statCards = [
    {
      label: "Total Events",
      value: events.length,
      color: "text-primary",
      bg: "bg-primary/10",
      icon: Calendar,
    },
    {
      label: "Upcoming",
      value: events.filter((e) => new Date(e.start_datetime) > new Date())
        .length,
      color: "text-secondary",
      bg: "bg-secondary/10",
      icon: CheckCircle2,
    },
    {
      label: "Total Seats",
      value: events.reduce((s, e) => s + (e.max_attendees ?? 0), 0) || "∞",
      color: "text-accent",
      bg: "bg-accent/10",
      icon: Users,
    },
  ] as const;

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
            Events
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage and publish your events.
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Add Event
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
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
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              All Events
            </h3>
            <p className="text-xs text-muted-foreground">
              {events.length} events total
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3">Event</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Start</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Seats</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-16 text-center text-sm text-muted-foreground"
                  >
                    Loading…
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-8 w-8 text-muted-foreground/40" />
                      <p>No events yet. Add one to get started.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                events.map((ev) => {
                  const status = statusFromDates(
                    ev.start_datetime,
                    ev.end_datetime,
                  );
                  return (
                    <tr
                      key={ev.idx}
                      className="border-b border-border last:border-0 transition-colors hover:bg-muted/30"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {ev.cover_image ? (
                            <Image
                              src={ev.cover_image}
                              alt={ev.title}
                              width={36}
                              height={36}
                              className="h-9 w-9 shrink-0 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-base">
                              🚀
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {ev.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {ev.organizer?.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {ev.category?.name}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-foreground">
                          {formatDate(ev.start_datetime)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTime(ev.start_datetime)}
                        </p>
                      </td>
                      <td className="max-w-[160px] px-6 py-4 text-sm text-muted-foreground">
                        <span className="line-clamp-1">
                          {ev.location?.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                            status.cls,
                          )}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-foreground">
                        {ev.max_attendees === 0 ? (
                          <span className="text-muted-foreground">
                            Unlimited
                          </span>
                        ) : (
                          ev.max_attendees
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5 rounded-lg px-3 text-xs"
                            onClick={() => {
                              setEditing(ev);
                              setOpen(true);
                            }}
                          >
                            <Pencil className="h-3 w-3" /> Edit
                          </Button>
                          <DeleteAlertDialog
                            url={`/api/event/events/${ev.idx}`}
                            queryKey={EVENTS_QUERY_KEY}
                            eventName={ev.title}
                            onSuccess={() => console.log("deleted!")}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <EventForm open={open} onOpenChange={setOpen} editing={editing} />
    </div>
  );
}
