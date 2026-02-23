"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useStore } from "@tanstack/react-store";
import { z } from "zod";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import FormInput from "@/components/form/FormInput";
import FieldTextarea from "@/components/form/FieldTextarea";
import { FieldImageUpload } from "../form/ImageUploadField";
import { Event } from "@/lib/types";

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

// ─── SCHEMAS ─────────────────────────────────────────────────────────────────

const detailsSchema = z.object({
  name: z.string().min(1, "Name is required").min(2, "At least 2 characters"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  phone: z.string().optional(),
  note: z.string().max(300, "Max 300 characters").optional(),
});

const paymentSchema = z.object({
  screenshot: z
    .instanceof(File, { message: "Screenshot is required" })
    .refine((f) => f.size <= 5 * 1024 * 1024, "Max file size is 5 MB"),
});

type DetailsData = z.infer<typeof detailsSchema>;
type ScreenshotFile = File;

// ─── STEP BAR ────────────────────────────────────────────────────────────────

const STEPS = ["Details", "Payment", "Confirm"] as const;

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center px-10">
      {STEPS.map((label, i) => {
        const isLast = i === STEPS.length - 1;
        return (
          <div
            key={label}
            className={cn("flex items-center", !isLast && "flex-1")}
          >
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-300",
                  i < current && "bg-secondary text-secondary-foreground",
                  i === current &&
                    "bg-primary text-primary-foreground shadow-[0_0_0_4px_hsl(var(--primary)/0.15)]",
                  i > current && "bg-muted text-muted-foreground",
                )}
              >
                {i < current ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-[10px] font-semibold",
                  i === current ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  "mx-2 mb-4 h-px flex-1 transition-all duration-500",
                  i < current ? "bg-secondary" : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── STEP 0 — DETAILS ────────────────────────────────────────────────────────

function DetailsStep({ onNext }: { onNext: (data: DetailsData) => void }) {
  const form = useForm({
    defaultValues: { name: "", email: "", phone: "", note: "" },
    validators: { onChange: detailsSchema as any },
    onSubmit: async ({ value }) => onNext(value),
  });

  const { canSubmit, isSubmitting } = useStore(form.store, (s) => ({
    canSubmit: s.canSubmit,
    isSubmitting: s.isSubmitting,
  }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="flex flex-col gap-4"
    >
      <form.Field name="name">
        {(f) => (
          <FormInput
            field={f}
            label="Full name"
            placeholder="Aarav Karki"
            required
          />
        )}
      </form.Field>
      <form.Field name="email">
        {(f) => (
          <FormInput
            field={f}
            label="Email"
            type="email"
            placeholder="you@example.com"
            required
          />
        )}
      </form.Field>
      <form.Field name="phone">
        {(f) => (
          <FormInput
            field={f}
            label="Phone"
            type="tel"
            placeholder="+977 98XXXXXXXX"
          />
        )}
      </form.Field>
      <form.Field name="note">
        {(f) => (
          <FieldTextarea
            field={f}
            label="Note to organizer"
            placeholder="Anything you'd like the organizer to know…"
            maxLength={300}
            optional
          />
        )}
      </form.Field>
      <Button
        type="submit"
        disabled={!canSubmit || isSubmitting}
        className="mt-1 w-full gap-2 rounded-xl font-bold"
      >
        Continue to payment <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}

// ─── STEP 1 — PAYMENT ────────────────────────────────────────────────────────

function PaymentStep({
  event,
  onNext,
  onBack,
  submitting,
}: {
  event: Event;
  onNext: (file: ScreenshotFile) => void;
  onBack: () => void;
  submitting: boolean;
}) {
  const form = useForm({
    defaultValues: { screenshot: null as File | null },
    validators: { onChange: paymentSchema as any },
    onSubmit: async ({ value }) => onNext(value.screenshot as File),
  });

  const canSubmit = useStore(form.store, (s) => s.canSubmit);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="flex flex-col gap-4"
    >
      {/* Amount summary */}
      <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/30 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Entry fee</p>
          <p className="text-xs text-muted-foreground">{event.title}</p>
        </div>
        <span className="rounded-full bg-secondary/10 px-3 py-1 text-sm font-bold text-secondary">
          {event.is_paid ? `NPR ${event.price?.toLocaleString()}` : "Free"}
        </span>
      </div>

      {/* Screenshot upload */}
      <form.Field name="screenshot">
        {(f) => <FieldImageUpload field={f} label="Payment screenshot" />}
      </form.Field>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1 rounded-xl"
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          type="submit"
          disabled={!canSubmit || submitting}
          className="flex-1 gap-2 rounded-xl font-bold"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Verifying…
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" /> Confirm
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

// ─── STEP 2 — SUCCESS ────────────────────────────────────────────────────────

function SuccessStep({
  name,
  email,
  event,
  onClose,
}: {
  name: string;
  email: string;
  event: Event;
  onClose: () => void;
}) {
  const rows = [
    { label: "Name", value: name, cls: "" },
    { label: "Email", value: email, cls: "" },
    { label: "Event", value: event.title, cls: "" },
    { label: "Payment", value: "Pending review", cls: "text-secondary" },
  ];

  return (
    <div className="flex flex-col items-center gap-5 py-6 text-center animate-in zoom-in-95 fade-in duration-500">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <div className="absolute inset-0 animate-ping rounded-full bg-secondary/20 [animation-duration:1.5s]" />
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary/10">
          <CheckCircle2 className="h-10 w-10 text-secondary" />
        </div>
      </div>
      <div>
        <p className="font-heading text-2xl font-bold text-foreground">
          You're in! 🎉
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Your spot has been reserved. We'll confirm via email.
        </p>
      </div>
      <div className="w-full rounded-2xl border border-border bg-muted/40 p-4 text-left">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Booking summary
        </p>
        <div className="flex flex-col gap-2 text-xs">
          {rows.map((row) => (
            <div key={row.label} className="flex justify-between">
              <span className="text-muted-foreground">{row.label}</span>
              <span className={cn("font-semibold text-foreground", row.cls)}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>
      <Button className="w-full rounded-xl font-bold" onClick={onClose}>
        Done
      </Button>
    </div>
  );
}

// ─── TRIGGER CARD ─────────────────────────────────────────────────────────────

function TriggerCard({ event, onOpen }: { event: Event; onOpen: () => void }) {
  // All values derived from the real event prop
  const isPaid = event.is_paid ?? false;
  const price = event.price ?? 0;
  const startDate = event.start_datetime
    ? formatDate(event.start_datetime)
    : null;
  const startTime = event.start_datetime
    ? formatTime(event.start_datetime)
    : null;
  const endTime = event.end_datetime ? formatTime(event.end_datetime) : null;
  const timeRange =
    startTime && endTime ? `${startTime} – ${endTime}` : startTime;
  const location = event.location?.name ?? null;
  const maxSeats = event.max_attendees ?? 0;

  const metaRows = [
    startDate && {
      icon: Calendar,
      color: "text-primary",
      text: startDate,
      bold: true,
    },
    timeRange && {
      icon: Clock,
      color: "text-secondary",
      text: timeRange,
      bold: false,
    },
    location && {
      icon: MapPin,
      color: "text-accent",
      text: location,
      bold: false,
    },
  ].filter(Boolean) as {
    icon: any;
    color: string;
    text: string;
    bold: boolean;
  }[];

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-md">
      <div className="h-1 w-full bg-gradient-to-r from-primary via-secondary to-accent" />
      <div className="flex flex-col gap-4 p-5">
        {/* Badge row */}
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-bold",
              isPaid
                ? "bg-accent/10 text-accent"
                : "bg-secondary/10 text-secondary",
            )}
          >
            {isPaid ? `NPR ${price.toLocaleString()}` : "Free"}
          </span>
          {maxSeats > 0 && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <Users className="h-3 w-3 text-accent" />
              {maxSeats} seats available
            </span>
          )}
        </div>

        {/* Meta rows — only shown when data present */}
        {metaRows.length > 0 && (
          <div className="flex flex-col gap-2.5 rounded-xl bg-muted/50 p-3.5">
            {metaRows.map(({ icon: Icon, color, text, bold }) => (
              <div key={text} className="flex items-center gap-2.5 text-xs">
                <Icon className={cn("h-3.5 w-3.5 shrink-0", color)} />
                <span
                  className={
                    bold
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground"
                  }
                >
                  {text}
                </span>
              </div>
            ))}
          </div>
        )}

        <Button
          size="lg"
          className="w-full gap-2 rounded-xl font-bold"
          onClick={onOpen}
        >
          Join this event <ArrowRight className="h-4 w-4" />
        </Button>
        <p className="text-center text-[11px] text-muted-foreground">
          {isPaid
            ? "Secure payment · Instant confirmation"
            : "Free · No credit card required"}
        </p>
      </div>
    </div>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

export default function JoinEvent({ event }: { event: Event }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [anim, setAnim] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savedName, setSavedName] = useState("");
  const [savedEmail, setSavedEmail] = useState("");

  const goTo = (next: number) => {
    setAnim(true);
    setTimeout(() => {
      setStep(next);
      setAnim(false);
    }, 220);
  };

  const handleOpenChange = (o: boolean) => {
    setOpen(o);
    if (!o)
      setTimeout(() => {
        setStep(0);
        setSavedName("");
        setSavedEmail("");
      }, 300);
  };

  const handleDetailsNext = (data: DetailsData) => {
    setSavedName(data.name);
    setSavedEmail(data.email);
    goTo(1);
  };

  const handlePaymentNext = (_file: ScreenshotFile) => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      goTo(2);
    }, 1400);
  };

  const accentLine =
    step === 2
      ? "from-secondary via-green-400 to-secondary"
      : "from-primary via-secondary to-accent";

  return (
    <>
      <TriggerCard event={event} onOpen={() => setOpen(true)} />

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="overflow-hidden rounded-3xl border border-border/60 bg-card p-0 shadow-2xl ring-1 ring-inset ring-white/[0.06] sm:max-w-md">
          <DialogTitle className="sr-only">Join this event</DialogTitle>

          <div
            className={cn(
              "h-[2.5px] w-full bg-gradient-to-r transition-all duration-700",
              accentLine,
            )}
          />

          <div className="max-h-[85vh] overflow-y-auto px-6 pb-6 pt-5">
            {/* Header */}
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10 text-2xl">
                {event.cover_image ? (
                  <img
                    src={event.cover_image}
                    alt={event.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  "🚀"
                )}
              </div>
              <div className="min-w-0">
                <h2 className="font-heading text-lg font-bold text-foreground">
                  Join the event
                </h2>
                <p className="truncate text-xs text-muted-foreground">
                  {event.title}
                </p>
              </div>
            </div>

            {step < 2 && (
              <div className="mb-6">
                <StepBar current={step} />
              </div>
            )}

            <div
              className={cn(
                "transition-all duration-[220ms] ease-[ease]",
                anim ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100",
              )}
            >
              {step === 0 && <DetailsStep onNext={handleDetailsNext} />}
              {step === 1 && (
                <PaymentStep
                  event={event}
                  onNext={handlePaymentNext}
                  onBack={() => goTo(0)}
                  submitting={submitting}
                />
              )}
              {step === 2 && (
                <SuccessStep
                  name={savedName}
                  email={savedEmail}
                  event={event}
                  onClose={() => setOpen(false)}
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
