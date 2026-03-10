"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useStore } from "@tanstack/react-store";
import { z } from "zod";
import {
  ArrowRight,
  CheckCircle2,
  Images,
  Calendar,
  MapPin,
  Users,
  Tag,
  Clock,
  DollarSign,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn, useApiMutation } from "@/lib/utils";
import StyledInput from "@/components/form/FormInput";
import FieldTextarea from "@/components/form/FieldTextarea";
import ImageUpload, { FieldImageUpload } from "../form/ImageUploadField";
import { FieldSelect } from "../form/FieldSelect";
import { EVENTS_QUERY_KEY } from "@/constants";
import { Event } from "@/lib/types";
import { Switch } from "../ui/switch";
import { FieldTagInput } from "../form/TagInput";

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
  tags: z.array(z.string()).optional(),
});

type EventValues = z.infer<typeof eventSchema>;
type FormStep = "event" | "gallery" | "done";
const toLocalInput = (iso: string) => (iso ? iso.slice(0, 16) : "");

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

// ─── STEP DOTS ───────────────────────────────────────────────────────────────

function StepDots({ step }: { step: FormStep }) {
  if (step === "done") return null;
  return (
    <div className="flex items-center justify-center gap-1.5 pb-2">
      {(["event", "gallery"] as const).map((s) => (
        <div
          key={s}
          className={cn(
            "h-1.5 rounded-full transition-all duration-300",
            step === s ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/30",
          )}
        />
      ))}
    </div>
  );
}

// ─── GALLERY STEP ────────────────────────────────────────────────────────────

function GalleryStep({
  eventIdx,
  onDone,
}: {
  eventIdx: string;
  onDone: () => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);

  const { mutateAsync: uploadImage } = useApiMutation({
    apiPath: `/api/event/events/${eventIdx}/images/`,
    method: "POST",
    queryKey: EVENTS_QUERY_KEY,
  });

  const handleUpload = async () => {
    if (!files.length) {
      onDone();
      return;
    }
    setUploading(true);
    for (const file of files) {
      const fd = new FormData();
      fd.append("image", file);
      try {
        await uploadImage(fd as any);
        setUploadedCount((c) => c + 1);
      } catch {
        // individual failures toasted by useApiMutation — continue with rest
      }
    }
    setUploading(false);
    onDone();
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/10">
          <Images className="h-5 w-5 text-secondary" />
        </div>
        <h2 className="font-heading text-xl font-bold text-foreground">
          Add gallery photos
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Upload photos for your event — or skip to finish.
        </p>
      </div>

      <ImageUpload
        multiple
        value={files}
        onChange={setFiles}
        label="Gallery images"
        hint="PNG, JPG or WEBP · Max 5 MB each"
        maxSizeMB={5}
      />

      {/* Upload progress bar */}
      {uploading && files.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Uploading…</span>
            <span>
              {uploadedCount} / {files.length}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${(uploadedCount / files.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1 rounded-xl"
          disabled={uploading}
          onClick={onDone}
        >
          Skip
        </Button>
        <Button
          type="button"
          className="flex-1 gap-2 rounded-xl font-bold"
          disabled={uploading || !files.length}
          onClick={handleUpload}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
            </>
          ) : (
            <>
              <ArrowRight className="h-4 w-4" /> Upload
              {files.length > 0 ? ` (${files.length})` : ""}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── SUCCESS SCREEN ──────────────────────────────────────────────────────────

function SuccessScreen({ isEdit }: { isEdit: boolean }) {
  return (
    <div
      className="flex flex-col items-center gap-4 py-10 text-center"
      style={{ animation: "scaleIn 0.4s cubic-bezier(0.34,1.5,0.64,1) both" }}
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
  );
}

// ─── EVENT FORM DIALOG ───────────────────────────────────────────────────────

export function EventForm({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: Event | null;
}) {
  const isEdit = !!editing;
  const [step, setStep] = useState<FormStep>("event");
  const [createdEventIdx, setCreatedEventIdx] = useState("");

  const { mutateAsync: createEvent } = useApiMutation<EventValues>({
    apiPath: "/api/event/events/",
    method: "POST",
    queryKey: EVENTS_QUERY_KEY,
  });

  const { mutateAsync: updateEvent } = useApiMutation<EventValues>({
    apiPath: `/api/event/events/${editing?.idx}/`,
    method: "PATCH",
    queryKey: EVENTS_QUERY_KEY,
  });

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
      tags: editing?.tags ?? [],
    } satisfies EventValues,
    validators: { onChange: eventSchema as any },
    onSubmit: async ({ value }) => {
      if (isEdit) {
        // Edit: save → done (no gallery step)
        await updateEvent(value);
        setStep("done");
        setTimeout(() => {
          setStep("event");
          onOpenChange(false);
        }, 1400);
      } else {
        // Create: save → gallery step
        const data: any = await createEvent(value);
        setCreatedEventIdx(data?.idx ?? "");
        setStep("gallery");
      }
    },
  });

  const isPaid = useStore(form.store, (s) => s.values.is_paid);
  const { canSubmit, isSubmitting } = useStore(form.store, (s) => ({
    canSubmit: s.canSubmit,
    isSubmitting: s.isSubmitting,
  }));

  const handleOpenChange = (o: boolean) => {
    if (!o) {
      setStep("event");
      setCreatedEventIdx("");
      form.reset();
    }
    onOpenChange(o);
  };

  const handleGalleryDone = () => {
    setStep("done");
    setTimeout(() => {
      setStep("event");
      onOpenChange(false);
    }, 1400);
  };

  const accentClass =
    step === "done"
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
          <StepDots step={step} />

          {/* ── DONE ── */}
          {step === "done" && <SuccessScreen isEdit={isEdit} />}

          {/* ── GALLERY ── */}
          {step === "gallery" && (
            <GalleryStep
              eventIdx={createdEventIdx}
              onDone={handleGalleryDone}
            />
          )}

          {/* ── EVENT DETAILS FORM ── */}
          {step === "event" && (
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

                <Section label="Media" />

                <form.Field name="cover_image">
                  {(f) => <FieldImageUpload field={f} label="Cover image" />}
                </form.Field>

                <form.Field name="tags">
                  {(f) => (
                    <FieldTagInput
                      field={f}
                      label="Tags"
                      placeholder="Type a tag and press Space…"
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
                      Next: Add photos <Images className="h-4 w-4" />{" "}
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
