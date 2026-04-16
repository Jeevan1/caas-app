"use client";

import { useEffect, useState } from "react";
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
  Clock,
  DollarSign,
  Loader2,
  Globe,
  X,
  Loader,
  Video,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn, useApiMutation } from "@/lib/utils";
import StyledInput from "@/components/form/FormInput";
import FieldTextarea from "@/components/form/FieldTextarea";
import ImageUpload, { FieldImageUpload } from "../form/ImageUploadField";
import { VideoUploadField } from "../form/VideoUploadField";

import { FieldSelect } from "../form/FieldSelect";
import { EVENT_DETAILS_QUERY_KEY, EVENTS_QUERY_KEY } from "@/constants";
import { Event, GalleryImage, PaginatedAPIResponse } from "@/lib/types";
import { Switch } from "../ui/switch";
import { FieldTagInput } from "../form/TagInput";
import { MapPicker } from "../MapPicker";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import Image from "next/image";
import DateInput from "../form/DateInput";

// ─── SCHEMA ──────────────────────────────────────────────────────────────────

const locationSchema = z.object({
  name: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
});

const eventSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .min(2, "At least 2 characters"),
    description: z
      .string()
      .min(1, "Description is required")
      .max(10000, "Max 10000 characters"),
    category: z.string().min(1, "Category is required"),
    start_datetime: z.coerce.date(),
    end_datetime: z.coerce.date(),
    is_online: z.boolean().default(false),
    online_url: z.string().optional(),
    location: locationSchema,
    is_paid: z.boolean(),
    price: z.string().optional(),
    payment_qr: z.any().optional(),
    max_attendees: z.string().regex(/^\d+$/, "Must be a number"),
    cover_image: z.any(),
    tags: z.array(z.string()).optional(),
    status: z.any().optional(),
  })

  .superRefine(
    (
      {
        start_datetime,
        end_datetime,
        is_paid,
        price,
        payment_qr,
        location,
        is_online,
        online_url,
      },
      ctx,
    ) => {
      if (start_datetime && end_datetime && start_datetime >= end_datetime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["end_datetime"],
          message: "End must be after start date & time",
        });
      }

      if (
        is_paid &&
        (!price || price.trim() === "" || parseFloat(price) <= 0)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["price"],
          message: "Price is required for paid events",
        });
      }
      if (
        is_paid &&
        (!payment_qr ||
          (!(payment_qr instanceof File) && typeof payment_qr !== "string"))
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["payment_qr"],
          message: "Please upload QR image for payment",
        });
      }

      if (is_online && (!online_url || online_url.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["online_url"],
          message: "Meeting link is required for online events",
        });
      }

      if (!is_online) {
        const hasCoords = !!location.latitude && !!location.longitude;
        if (hasCoords && (!location.name || location.name.trim() === "")) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["location", "name"],
            message: "Venue name is required when a pin is set",
          });
        }
      }
    },
  );

type EventValues = z.infer<typeof eventSchema>;
type FormStep = "event" | "gallery" | "done";

const toLocalInput = (iso: string) => (iso ? iso.slice(0, 16) : "");

// ─── Build PATCH payload — only changed fields ────────────────────────────────

function buildPatchPayload(
  values: EventValues,
  original: Event,
): Partial<EventValues> {
  const patch: Record<string, any> = {};

  // Scalar fields — direct comparison
  const scalarKeys = [
    "title",
    "description",
    "is_online",
    "online_url",
    "is_paid",
    "max_attendees",
    "tags",
    "status",
  ] as const;

  for (const key of scalarKeys) {
    const newVal = values[key];
    let oldVal: any = (original as any)[key];

    // Normalise: API returns numbers, form holds strings
    if (key === "max_attendees") oldVal = String(oldVal ?? 0);

    // tags: compare JSON stringified
    if (key === "tags") {
      const newTags = JSON.stringify(newVal ?? []);
      const oldTags = JSON.stringify(oldVal ?? []);
      if (newTags !== oldTags) patch[key] = newVal;
      continue;
    }

    if (newVal !== oldVal) patch[key] = newVal;
  }

  // category — form stores idx string, API returns object with idx
  const newCat = values.category;
  const oldCat = original.category?.idx ?? "";
  if (newCat !== oldCat) patch["category"] = newCat;

  // start_datetime / end_datetime — compare truncated ISO strings
  // start_datetime
  const newStart =
    values.start_datetime instanceof Date
      ? values.start_datetime.toISOString().slice(0, 16)
      : values.start_datetime;
  const oldStart = toLocalInput(original.start_datetime ?? "");
  if (newStart !== oldStart) patch["start_datetime"] = newStart;

  // end_datetime
  const newEnd =
    values.end_datetime instanceof Date
      ? values.end_datetime.toISOString().slice(0, 16)
      : values.end_datetime;
  const oldEnd = toLocalInput(original.end_datetime ?? "");
  if (newEnd !== oldEnd) patch["end_datetime"] = newEnd;

  // price — API returns number, form holds string
  const newPrice = values.price ?? "";
  const oldPrice =
    original.price && original.price > 0 ? String(original.price) : "";
  if (newPrice !== oldPrice) patch["price"] = newPrice;

  // File fields — only include if a new File was selected
  if (values.cover_image instanceof File)
    patch["cover_image"] = values.cover_image;
  if (values.payment_qr instanceof File)
    patch["payment_qr"] = values.payment_qr;

  if (values.status !== original.status) patch["status"] = values.status;

  // location — skip entirely for online events; otherwise compare each sub-field
  if (!values.is_online) {
    const oldLat = String(original.location?.latitude ?? "");
    const oldLng = String(original.location?.longitude ?? "");
    const oldName = original.location?.name ?? "";

    const locChanged =
      values.location.name !== oldName ||
      (values.location.latitude ?? "") !== oldLat ||
      (values.location.longitude ?? "") !== oldLng;

    if (locChanged) patch["location"] = values.location;
  }

  return patch as Partial<EventValues>;
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

export function GalleryStep({
  eventIdx,
  onDone,
  onSkip,
}: {
  eventIdx: string;
  onDone: () => void;
  onSkip: () => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedVideoCount, setUploadedVideoCount] = useState(0);
  const [deletingIdx, setDeletingIdx] = useState<string | null>(null);
  const [deletingVideoIdx, setDeletingVideoIdx] = useState<string | null>(null);

  const { data: images } = useApiQuery<{
    results: { idx: string; image: string }[];
  }>({
    url: `/api/event/events/${eventIdx}/images/`,
    queryKey: EVENT_DETAILS_QUERY_KEY(eventIdx),
  });

  const { data: videos } = useApiQuery<{
    results: { idx: string; video: string; title?: string }[];
  }>({
    url: `/api/event/events/${eventIdx}/videos/`,
    queryKey: [...EVENT_DETAILS_QUERY_KEY(eventIdx), "videos"],
  });

  const [existingImages, setExistingImages] = useState<
    { idx: string; image: string }[]
  >([]);

  const [existingVideos, setExistingVideos] = useState<
    { idx: string; video: string; title?: string }[]
  >([]);

  useEffect(() => {
    if (images?.results) {
      setExistingImages(images.results);
    }
  }, [images]);

  useEffect(() => {
    if (videos?.results) {
      setExistingVideos(videos.results);
    }
  }, [videos]);

  const { mutateAsync: uploadImage } = useApiMutation({
    apiPath: `/api/event/events/${eventIdx}/images/`,
    method: "POST",
    queryKey: EVENTS_QUERY_KEY,
    showSuccessuseToast: false,
  });

  const { mutateAsync: uploadVideo } = useApiMutation({
    apiPath: `/api/event/events/${eventIdx}/videos/`,
    method: "POST",
    queryKey: EVENTS_QUERY_KEY,
    showSuccessuseToast: false,
  });

  const { mutateAsync: deleteImage, isPending: deleting } = useApiMutation({
    apiPath: (idx) => `/api/event/events/${eventIdx}/images/${idx}/`,
    method: "DELETE",
    queryKey: EVENT_DETAILS_QUERY_KEY(eventIdx),
    successMessage: "Image deleted successfully!",
  });

  const { mutateAsync: deleteVideo } = useApiMutation({
    apiPath: (idx) => `/api/event/events/${eventIdx}/videos/${idx}/`,
    method: "DELETE",
    queryKey: [...EVENT_DETAILS_QUERY_KEY(eventIdx), "videos"],
    successMessage: "Video deleted successfully!",
  });

  const handleRemoveExisting = async (idx: string) => {
    try {
      setDeletingIdx(idx);
      await deleteImage(idx);
      setExistingImages((prev) => prev.filter((img) => img.idx !== idx));
    } catch (err) {
      console.error("Failed to delete image", err);
    } finally {
      setDeletingIdx(null);
    }
  };

  const handleRemoveExistingVideo = async (idx: string) => {
    try {
      setDeletingVideoIdx(idx);
      await deleteVideo(idx);
      setExistingVideos((prev) => prev.filter((v) => v.idx !== idx));
    } catch (err) {
      console.error("Failed to delete video", err);
    } finally {
      setDeletingVideoIdx(null);
    }
  };

  const handleUpload = async () => {
    setUploadError(null);
    if (!files.length && !videoFiles.length) {
      onDone();
      return;
    }

    setUploading(true);
    setUploadedCount(0);
    setUploadedVideoCount(0);

    let hasError = false;

    for (const file of files) {
      const fd = new FormData();
      fd.append("image", file);
      try {
        await uploadImage(fd as any);
        setUploadedCount((c) => c + 1);
      } catch (err) {
        console.error("Image upload failed", err);
        hasError = true;
        setUploadError("Some uploads failed. Please try again.");
      }
    }

    for (const vid of videoFiles) {
      const fd = new FormData();
      fd.append("video", vid);
      try {
        await uploadVideo(fd as any);
        setUploadedVideoCount((c) => c + 1);
      } catch (err) {
        console.error("Video upload failed", err);
        hasError = true;
      }
    }

    setUploading(false);

    if (hasError) {
      return;
    }

    onDone();
  };

  const [activeTab, setActiveTab] = useState<"photos" | "video">("photos");

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/10">
          {activeTab === "photos" ? (
            <Images className="h-5 w-5 text-secondary" />
          ) : (
            <Video className="h-5 w-5 text-secondary" />
          )}
        </div>
        <h2 className="font-heading text-xl font-bold text-foreground">
          {activeTab === "photos" ? "Add gallery photos" : "Add event video"}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {activeTab === "photos"
            ? "Upload photos for your event — or switch to video."
            : "Upload a video for your event — or switch to photos."}
        </p>
      </div>
      {/* ── Tab switcher ── */}
      <div className="flex rounded-xl border border-border bg-muted/30 p-1 gap-1">
        {(["photos", "video"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-sm font-semibold transition-all duration-200",
              activeTab === tab
                ? "text-primary-foreground shadow-sm bg-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab === "photos" ? (
              <>
                <Images className="h-3.5 w-3.5" />
                Photos
                {existingImages.length + files.length > 0 && (
                  <span
                    className={cn(
                      "ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                      activeTab === "photos"
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {existingImages.length + files.length}
                  </span>
                )}
              </>
            ) : (
              <>
                <Video className="h-3.5 w-3.5" />
                Video
                {existingVideos.length + videoFiles.length > 0 && (
                  <span
                    className={cn(
                      "ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                      activeTab === "video"
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {existingVideos.length + videoFiles.length}
                  </span>
                )}
              </>
            )}
          </button>
        ))}
      </div>
      {/* ── Photos tab ── */}
      {activeTab === "photos" && (
        <div className="flex flex-col gap-4">
          {/* Existing images from API */}
          {existingImages.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {existingImages.map((img) => (
                <div
                  key={img.image}
                  className="relative h-20 w-20 overflow-hidden rounded-xl border border-border"
                >
                  {deletingIdx === img.idx && (
                    <span className="absolute inset-0 z-10 flex items-center justify-center bg-background/50">
                      <Loader2 className="animate-spin text-primary" />
                    </span>
                  )}
                  <Image
                    src={img.image}
                    alt="existing"
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveExisting(img.idx)}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-foreground/70 text-background hover:bg-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* New image uploads */}
          <ImageUpload
            multiple
            value={files}
            onChange={setFiles}
            label="Gallery images"
            hint="PNG, JPG or WEBP · Max 5 MB each"
            maxSizeMB={5}
          />

          {/* Image upload progress */}
          {uploading && files.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Uploading photos…</span>
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
        </div>
      )}
      {/* ── Video tab ── */}
      {activeTab === "video" && (
        <div className="flex flex-col gap-4">
          {/* Existing videos from API */}
          {existingVideos.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {existingVideos.map((v) => (
                <div
                  key={v.idx}
                  className="relative overflow-hidden rounded-xl border border-border bg-black aspect-video"
                >
                  {deletingVideoIdx === v.idx && (
                    <span className="absolute inset-0 z-10 flex items-center justify-center bg-background/50">
                      <Loader2 className="animate-spin text-primary" />
                    </span>
                  )}
                  <video src={v.video} controls className="w-full h-full" />
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingVideo(v.idx)}
                    className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-foreground/70 text-background hover:bg-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* New video upload */}
          <VideoUploadField
            multiple
            id="gallery-video-upload"
            value={videoFiles}
            onChange={setVideoFiles}
            label="Click to upload videos"
            hint="MP4, WebM or Ogg · Max 500 MB · multiple allowed"
            maxSizeMB={500}
          />

          {/* Video upload progress */}
          {uploading && videoFiles.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Uploading videos…</span>
                <span>
                  {uploadedVideoCount} / {videoFiles.length}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{
                    width: `${(uploadedVideoCount / videoFiles.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}
      {uploadError && (
        <p className="text-xs text-red-500 text-center">{uploadError}</p>
      )}
      {/* ── Footer actions ── */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1 rounded-xl"
          disabled={uploading}
          onClick={onSkip}
        >
          Skip
        </Button>
        <Button
          type="button"
          className="flex-1 gap-2 rounded-xl font-bold"
          disabled={uploading || (!files.length && !videoFiles.length)}
          onClick={handleUpload}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
            </>
          ) : (
            <>
              <ArrowRight className="h-4 w-4" /> Upload
              {files.length + videoFiles.length > 0
                ? ` (${files.length + videoFiles.length})`
                : ""}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── SUCCESS SCREEN ──────────────────────────────────────────────────────────

export function SuccessScreen({ isEdit }: { isEdit: boolean }) {
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
  initialStep = "event",
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: Event | null;
  /** Jump straight to gallery (e.g. from the Gallery button in the table) */
  initialStep?: FormStep;
}) {
  const isEdit = !!editing;
  const [step, setStep] = useState<FormStep>(initialStep);

  // Keep step in sync when the dialog is opened with a different initialStep
  useEffect(() => {
    if (open) setStep(initialStep);
  }, [open, initialStep]);

  const [createdEventIdx, setCreatedEventIdx] = useState("");

  const form = useForm({
    defaultValues: {
      title: editing?.title ?? "",
      description: editing?.description ?? "",
      category: editing?.category?.idx ?? "",
      start_datetime: editing?.start_datetime
        ? new Date(editing.start_datetime)
        : new Date(),
      end_datetime: editing?.end_datetime
        ? new Date(editing.end_datetime)
        : new Date(),
      is_online: editing?.is_online ?? false,
      online_url: editing?.online_url ?? "",
      location: {
        name: editing?.location?.name ?? "",
        latitude: editing?.location?.latitude?.toString() ?? "",
        longitude: editing?.location?.longitude?.toString() ?? "",
      },
      status: editing?.status ?? 0,
      is_paid: editing?.is_paid ?? false,
      price:
        editing?.price && editing.price > 0 ? editing.price.toString() : "",
      // Keep URL string so FieldImageUpload can show existing preview
      payment_qr: editing?.payment_qr ?? undefined,
      max_attendees: editing?.max_attendees?.toString() ?? "0",
      // Keep URL string so FieldImageUpload can show existing preview
      cover_image: editing?.cover_image ?? undefined,
      tags: editing?.tags ?? [],
    } satisfies EventValues,
    validators: { onChange: eventSchema as any },
    onSubmit: async ({ value }) => {
      if (isEdit && editing) {
        const patch = buildPatchPayload(value, editing);
        // Nothing changed — skip the request and close
        if (Object.keys(patch).length === 0) {
          setStep("done");
          setTimeout(() => handleOpenChange(false), 1400);
          return;
        }
        await updateEvent(patch as any);
        setStep("done");
        setTimeout(() => handleOpenChange(false), 1400);
      } else {
        const data: any = await createEvent(value);
        setCreatedEventIdx(data?.idx ?? "");
        setStep("gallery");
      }
    },
  });

  const isPaid = useStore(form.store, (s) => s.values.is_paid);
  const isOnline = useStore(form.store, (s) => s.values.is_online);
  const { canSubmit, isSubmitting } = useStore(form.store, (s) => ({
    canSubmit: s.canSubmit,
    isSubmitting: s.isSubmitting,
  }));

  const { mutateAsync: createEvent } = useApiMutation<EventValues>({
    apiPath: "/api/event/events/",
    method: "POST",
    queryKey: EVENTS_QUERY_KEY,
    payloadTransform(payload) {
      if (payload.is_online) return { ...payload, location: undefined };
      return payload;
    },
  });

  // PATCH — payload is already diffed; just forward it as-is
  const { mutateAsync: updateEvent } = useApiMutation<Partial<EventValues>>({
    apiPath: `/api/event/events/my-events/${editing?.idx}/`,
    method: "PATCH",
    queryKey: EVENTS_QUERY_KEY,
  });

  const handleOpenChange = (o: boolean) => {
    onOpenChange(o);
    if (!o) {
      setTimeout(() => {
        setStep("event");
        setCreatedEventIdx("");
        form.reset();
      }, 300);
    }
  };

  const handleGalleryDone = () => {
    setStep("done");
    setTimeout(() => handleOpenChange(false), 1400);
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

          {step === "done" && <SuccessScreen isEdit={isEdit} />}

          {step === "gallery" && (
            <GalleryStep
              eventIdx={createdEventIdx || editing?.idx || ""}
              onDone={handleGalleryDone}
              onSkip={() => handleOpenChange(false)}
            />
          )}

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
                      maxLength={10000}
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
                      <DateInput
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
                      <DateInput
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

                <form.Field name="is_online">
                  {(f) => (
                    <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-3.5 py-3">
                      <div className="flex items-center gap-2.5">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            Online event
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Hosted via a link instead of a physical venue
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={Boolean(f.state.value)}
                        onCheckedChange={(v) => {
                          f.handleChange(v);
                          if (v) {
                            form.setFieldValue("location.latitude", "");
                            form.setFieldValue("location.longitude", "");
                            form.setFieldValue("location.name", "");
                          }
                        }}
                      />
                    </div>
                  )}
                </form.Field>

                {isOnline ? (
                  <form.Field name="online_url">
                    {(f) => (
                      <StyledInput
                        field={f}
                        label="Meeting link"
                        placeholder="https://meet.google.com/..."
                        icon={Globe}
                      />
                    )}
                  </form.Field>
                ) : (
                  <>
                    <form.Subscribe
                      selector={(s) => ({
                        lat: s.values.location.latitude,
                        lng: s.values.location.longitude,
                        name: s.values.location.name,
                      })}
                    >
                      {({ lat, lng, name }) => (
                        <MapPicker
                          height={280}
                          value={
                            lat && lng
                              ? { lat: parseFloat(lat), lng: parseFloat(lng) }
                              : undefined
                          }
                          defaultCenter={{ lat: 27.7172, lng: 85.324 }}
                          onChange={(coords) => {
                            form.setFieldValue(
                              "location.latitude",
                              String(coords.lat),
                            );
                            form.setFieldValue(
                              "location.longitude",
                              String(coords.lng),
                            );
                          }}
                          onLocationName={(autoName) => {
                            if (!name || name.trim() === "") {
                              form.setFieldValue("location.name", autoName);
                            }
                          }}
                        />
                      )}
                    </form.Subscribe>
                    <form.Field name="location.latitude">
                      {() => null}
                    </form.Field>
                    <form.Field name="location.longitude">
                      {() => null}
                    </form.Field>
                  </>
                )}

                {/* Venue name — shown below the map for in-person events */}
                {!isOnline && (
                  <form.Field name="location.name">
                    {(f) => (
                      <StyledInput
                        field={f}
                        label="Venue name"
                        placeholder="e.g. Kathmandu Convention Centre"
                        icon={MapPin}
                      />
                    )}
                  </form.Field>
                )}

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
                {isPaid && (
                  <form.Field name="payment_qr">
                    {(f) => <FieldImageUpload field={f} label="Payment QR" />}
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
                <form.Field name="status">
                  {(f) => (
                    <FieldSelect
                      field={f}
                      label="Status"
                      options={[
                        { label: "Draft", value: "1" },
                        { label: "Published", value: "2" },
                      ]}
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
                      Save changes <ArrowRight className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Next: Add photos <Images className="h-4 w-4" />
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
