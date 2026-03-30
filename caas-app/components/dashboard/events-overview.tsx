"use client";

import { useState } from "react";
import {
  Plus,
  Pencil,
  CheckCircle2,
  Calendar,
  Users,
  ImageUp,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { EVENTS_QUERY_KEY } from "@/constants";
import { Event, PaginatedAPIResponse } from "@/lib/types";
import { DeleteAlertDialog } from "../DeleteAlertDialog";
import { EventForm } from "./GalleryForm";
import { statusFromDates } from "@/lib/helpers";
import { useCurrentUser } from "@/lib/providers";
import { hasPermission } from "@/lib/permissions/has-permissions";
import { Link, redirect } from "@/i18n/navigation";
import { useLocale } from "next-intl";

import { MoreHorizontal, ExternalLink, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Section } from "../section";
// ─── HELPERS ─────────────────────────────────────────────────────────────────

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatTime = (time: string) => {
  const t = time.split("T")[1]?.slice(0, 5); // "HH:MM"
  if (!t) return "";

  let [hour, minute] = t.split(":").map(Number);

  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12; // convert 0 → 12

  return `${hour}:${minute.toString().padStart(2, "0")} ${ampm}`;
};

// ─── COMPONENT ───────────────────────────────────────────────────────────────

const ActionItem = ({
  ev,
  openEdit,
  openGallery,
}: {
  ev: Event;
  openEdit: (ev: Event) => void;
  openGallery: (ev: Event) => void;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-lg">
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">Open menu</span>
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent align="end" className="w-48">
      <DropdownMenuItem onClick={() => openEdit(ev)}>
        <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
      </DropdownMenuItem>

      <DropdownMenuItem onClick={() => openGallery(ev)}>
        <ImageUp className="h-3.5 w-3.5 mr-2" /> Gallery
      </DropdownMenuItem>

      <DropdownMenuItem asChild>
        <Link href={`/dashboard/events/${ev.idx}/join-requests`}>
          <ExternalLink className="h-3.5 w-3.5 mr-2" /> View Requests
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link href={`/dashboard/events/${ev.idx}/summary`}>
          <Calendar className="h-3.5 w-3.5 mr-2" /> View Summary
        </Link>
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DeleteAlertDialog
        url={`/api/event/events/${ev.idx}`}
        queryKey={EVENTS_QUERY_KEY}
        eventName={ev.title}
        onSuccess={() => console.log("deleted!")}
        trigger={(open) => (
          <DropdownMenuItem
            onClick={open}
            className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30"
          >
            <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
          </DropdownMenuItem>
        )}
      />
    </DropdownMenuContent>
  </DropdownMenu>
);

export function EventsOverview() {
  const user = useCurrentUser();
  const locale = useLocale();

  if (!hasPermission(user, ["events-my-events:get"])) {
    redirect({ href: "/dashboard", locale });
  }

  // Single dialog state — initialStep controls which step opens first
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [initialStep, setInitialStep] = useState<"event" | "gallery" | "done">(
    "event",
  );

  const { data, isLoading } = useApiQuery<PaginatedAPIResponse<Event>>({
    url: "/api/event/events/my-events",
    queryKey: EVENTS_QUERY_KEY,
  });

  const events = data?.results ?? [];

  /** Open the dialog for creating a new event */
  const openCreate = () => {
    setEditing(null);
    setInitialStep("event");
    setDialogOpen(true);
  };

  /** Open the dialog to edit an existing event */
  const openEdit = (ev: Event) => {
    setEditing(ev);
    setInitialStep("event");
    setDialogOpen(true);
  };

  /** Open the dialog straight on the gallery step for an existing event */
  const openGallery = (ev: Event) => {
    setEditing(ev);
    setInitialStep("gallery");
    setDialogOpen(true);
  };

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
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Event
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {statCards.map((s, i) => (
          <Section
            delay={i * 0.1}
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
          </Section>
        ))}
      </div>

      {/* Table */}
      <Section
        delay={0.2}
        className="overflow-hidden rounded-xl border border-border bg-card"
      >
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
                <th className="px-6 py-3 text-right">Attendees</th>
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
                        <Link
                          href={`/dashboard/events/${ev.idx}/summary`}
                          className="flex items-center gap-3 group"
                        >
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
                            <p className="text-sm font-semibold text-foreground group-hover:text-primary">
                              {ev.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {ev.organizer?.name}
                            </p>
                          </div>
                        </Link>
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
                          {ev.is_online ? "Online" : ev.location?.name}
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
                      <td className="px-6 py-4 text-right text-sm text-foreground">
                        {ev.max_attendees === 0 ? (
                          <span className="text-muted-foreground">
                            Unlimited
                          </span>
                        ) : (
                          ev.joined_attendees
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ActionItem
                          ev={ev}
                          openEdit={openEdit}
                          openGallery={openGallery}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Single dialog for create / edit / gallery */}
      <EventForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        initialStep={initialStep}
      />
    </div>
  );
}
