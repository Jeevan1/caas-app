"use client";

import { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useStore } from "@tanstack/react-store";
import { z } from "zod";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowRight,
  CheckCircle2,
  Calendar,
  MapPin,
  Users,
  Tag,
  Clock,
  DollarSign,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn, useApiMutation } from "@/lib/utils";
import StyledInput from "@/components/form/FormInput";
import FieldTextarea from "@/components/form/FieldTextarea";
import { FieldImageUpload } from "../form/ImageUploadField";
import { FieldSelect } from "../form/FieldSelect";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { EVENTS_QUERY_KEY } from "@/constants";
import { Event, PaginatedAPIResponse } from "@/lib/types";
import { DeleteAlertDialog } from "../DeleteAlertDialog";
import { Switch } from "../ui/switch";
import { mapServerErrors } from "@/lib/api/error-handlers";

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
    .instanceof(File, { message: "Cover image is required" })
    .refine((f) => f.size <= 5 * 1024 * 1024, "Max 5 MB")
    .optional(),
  tags: z.string().optional(),
});

type EventValues = z.infer<typeof eventSchema>;

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const toLocalInput = (iso: string) => (iso ? iso.slice(0, 16) : "");

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
    return { label: "Completed", cls: "bg-muted text-muted-foreground" };
  return { label: "Active", cls: "bg-secondary/10 text-secondary" };
}

// ─── SECTION DIVIDER ─────────────────────────────────────────────────────────

function Section({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <div className="h-px flex-1 bg-border/60" />
    </div>
  );
}

function EventForm({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: Event | null;
}) {
  const [done, setDone] = useState(false);
  const isEdit = !!editing;

  // ── defaultValues fully mirror the schema shape ───────────────────────────
  const form = useForm({
    defaultValues: {
      title: editing?.title ?? "",
      description: editing?.description ?? "",
      category: editing?.category?.idx ?? "",
      start_datetime: toLocalInput(editing?.start_datetime ?? ""),
      end_datetime: toLocalInput(editing?.end_datetime ?? ""),
      location: {
        name: editing?.location?.name ?? "",
        latitude: editing?.location?.latitude?.toString() ?? "",
        longitude: editing?.location?.longitude?.toString() ?? "",
      },
      is_paid: editing?.is_paid ?? false,
      price:
        editing?.price && editing.price > 0 ? editing.price.toString() : "",
      max_attendees: editing?.max_attendees?.toString() ?? "0",
      cover_image: undefined as File | undefined,
      tags: "",
    } satisfies EventValues,
    validators: { onChange: eventSchema as any },
    onSubmit: async ({ value }) => {
      // buildBody in useApiMutation auto-detects cover_image (File)
      // and flattens location → location.name, location.latitude, location.longitude
      isEdit ? await updateEvent(value) : await createEvent(value);
      setDone(true);
      setTimeout(() => {
        setDone(false);
        onOpenChange(false);
      }, 1400);
    },
  });
  const { mutateAsync: createEvent } = useApiMutation<EventValues>({
    apiPath: "/api/event/events/",
    method: "POST",
    queryKey: EVENTS_QUERY_KEY,
  });

  const errorMap = useStore(form.store, (state) => state.errorMap);

  useEffect(() => {
    console.log("Current Form Errors:", errorMap);
  }, [errorMap]);

  const { mutateAsync: updateEvent } = useApiMutation<EventValues>({
    apiPath: `/api/event/events/${editing?.idx}/`,
    method: "PATCH",
    queryKey: EVENTS_QUERY_KEY,
  });

  const isPaid = useStore(form.store, (s) => s.values.is_paid);
  const { canSubmit, isSubmitting } = useStore(form.store, (s) => ({
    canSubmit: s.canSubmit,
    isSubmitting: s.isSubmitting,
  }));

  const handleOpenChange = (o: boolean) => {
    if (!o) {
      setDone(false);
      form.reset();
    }
    onOpenChange(o);
  };

  const accentClass = done
    ? "from-secondary via-green-400 to-secondary"
    : isEdit
      ? "from-accent via-primary to-secondary"
      : "from-primary via-secondary to-accent";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="overflow-hidden rounded-3xl border border-border bg-card p-0 shadow-2xl ring-1 ring-inset ring-white/[0.06] sm:max-w-xl">
        <DialogTitle className="sr-only">
          {isEdit ? "Edit event" : "Add event"}
        </DialogTitle>

        <div
          className={cn(
            "h-[2.5px] w-full bg-gradient-to-r transition-all duration-500",
            accentClass,
          )}
        />

        <div className="max-h-[85vh] overflow-y-auto px-6 pb-6 pt-4">
          {done ? (
            <div
              className="flex flex-col items-center gap-4 py-10 text-center"
              style={{
                animation: "scaleIn 0.4s cubic-bezier(0.34,1.5,0.64,1) both",
              }}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10">
                <CheckCircle2 className="h-8 w-8 text-secondary" />
              </div>
              <div>
                <p className="font-heading text-xl font-bold text-foreground">
                  {isEdit ? "Event updated!" : "Event created!"} 🎉
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Changes saved successfully.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4 text-center">
                <div
                  className={cn(
                    "mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl text-xl",
                    isEdit ? "bg-accent/10" : "bg-primary/10",
                  )}
                >
                  {isEdit ? "✏️" : "🚀"}
                </div>
                <h2 className="font-heading text-xl font-bold text-foreground">
                  {isEdit ? "Edit event" : "New event"}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isEdit
                    ? "Update the event details below"
                    : "Fill in the details to publish an event"}
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.handleSubmit();
                }}
                className="flex flex-col gap-4"
              >
                {/* Basic info */}
                <Section label="Basic info" />

                <form.Field name="title">
                  {(f) => (
                    <StyledInput
                      field={f}
                      label="Event title"
                      placeholder="e.g. Startup Pitch Night"
                    />
                  )}
                </form.Field>

                <form.Field name="description">
                  {(f) => (
                    <FieldTextarea
                      field={f}
                      label="Description"
                      maxLength={1000}
                      placeholder="What's this event about? Include agenda, what to bring, etc."
                    />
                  )}
                </form.Field>

                <form.Field name="category">
                  {(f) => (
                    <FieldSelect
                      field={f}
                      label="Category"
                      url="/api/event/categories/"
                      mapOptions={(cat) => ({
                        value: cat.idx,
                        label: cat.name,
                      })}
                    />
                  )}
                </form.Field>

                {/* Schedule */}
                <Section label="Schedule" />

                <div className="grid grid-cols-2 gap-6">
                  <form.Field name="start_datetime">
                    {(f) => (
                      <StyledInput
                        field={f}
                        label="Start"
                        type="datetime-local"
                        placeholder=""
                        icon={Calendar}
                      />
                    )}
                  </form.Field>
                  <form.Field name="end_datetime">
                    {(f) => (
                      <StyledInput
                        field={f}
                        label="End"
                        type="datetime-local"
                        placeholder=""
                        icon={Clock}
                      />
                    )}
                  </form.Field>
                </div>

                {/* Location — nested fields using dot notation */}
                <Section label="Location" />

                <form.Field name="location.name">
                  {(f) => (
                    <StyledInput
                      field={f}
                      label="Venue name"
                      placeholder="e.g. Thamel Business Hub"
                      icon={MapPin}
                    />
                  )}
                </form.Field>

                <div className="grid grid-cols-2 gap-3">
                  <form.Field name="location.latitude">
                    {(f) => (
                      <StyledInput
                        field={f}
                        label="Latitude"
                        type="number"
                        placeholder="27.7172"
                      />
                    )}
                  </form.Field>
                  <form.Field name="location.longitude">
                    {(f) => (
                      <StyledInput
                        field={f}
                        label="Longitude"
                        type="number"
                        placeholder="85.3240"
                      />
                    )}
                  </form.Field>
                </div>

                {/* Tickets */}
                <Section label="Tickets" />

                <form.Field name="is_paid">
                  {(f) => (
                    <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-3.5 py-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Paid event
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Enable to set an entry price
                        </p>
                      </div>
                      <Switch
                        checked={Boolean(f.state.value)}
                        onCheckedChange={(v) => f.handleChange(v)}
                      />
                    </div>
                  )}
                </form.Field>

                {isPaid && (
                  <form.Field name="price">
                    {(f) => (
                      <StyledInput
                        field={f}
                        label="Price (NPR)"
                        type="number"
                        placeholder="e.g. 500"
                        icon={DollarSign}
                      />
                    )}
                  </form.Field>
                )}

                <form.Field name="max_attendees">
                  {(f) => (
                    <StyledInput
                      field={f}
                      label="Max attendees"
                      type="number"
                      placeholder="0 = unlimited"
                      icon={Users}
                    />
                  )}
                </form.Field>

                {/* Media */}
                <Section label="Media" />

                <form.Field name="cover_image">
                  {(f) => <FieldImageUpload field={f} label="Cover image" />}
                </form.Field>

                <form.Field name="tags">
                  {(f) => (
                    <StyledInput
                      field={f}
                      label="Tags"
                      placeholder="startup, networking (comma separated)"
                      icon={Tag}
                    />
                  )}
                </form.Field>

                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className={cn(
                    "mt-2 w-full gap-2 rounded-xl font-bold",
                    isEdit && "bg-accent hover:bg-accent/90",
                  )}
                >
                  {isSubmitting ? (
                    isEdit ? (
                      "Saving…"
                    ) : (
                      "Creating…"
                    )
                  ) : isEdit ? (
                    <>
                      {" "}
                      Save changes <ArrowRight className="h-4 w-4" />{" "}
                    </>
                  ) : (
                    <>
                      {" "}
                      Create event <ArrowRight className="h-4 w-4" />{" "}
                    </>
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </DialogContent>

      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </Dialog>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

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
