"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

// ── Overlay ───────────────────────────────────────────────────────────────────
// Softer than black/80 — uses foreground token so it works in dark mode too.
// Backdrop blur gives depth without full black curtain.
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      // Base
      "fixed inset-0 z-50",
      // Softer, blurred overlay instead of solid black/80
      "bg-foreground/20 backdrop-blur-sm",
      // Radix state animations
      "data-[state=open]:animate-in   data-[state=open]:fade-in-0",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

// ── Content ───────────────────────────────────────────────────────────────────
// Richer shadow, refined border, subtle inner glow, better rounding.
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        // Position
        "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
        // Layout
        "grid w-full max-w-lg gap-4",
        // Shape
        "rounded-2xl",
        // Background — card token so it respects light/dark
        "bg-card",
        // Border — subtle, not harsh
        "border border-border/60",
        // Shadow system: ambient + directional + inner highlight
        "shadow-[0_0_0_1px_hsl(var(--border)/0.08),0_8px_16px_-4px_hsl(var(--foreground)/0.08),0_24px_48px_-8px_hsl(var(--foreground)/0.12)]",
        // Inner top highlight (light glass feel)
        "ring-1 ring-inset ring-white/[0.06]",
        // Padding
        "p-6",
        // Radix state animations — spring-like feel
        "duration-200",
        "data-[state=open]:animate-in   data-[state=open]:fade-in-0   data-[state=open]:zoom-in-95   data-[state=open]:slide-in-from-left-1/2   data-[state=open]:slide-in-from-top-[48%]",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
        className,
      )}
      {...props}
    >
      {children}

      {/* ── Close button — more polished than default ── */}
      <DialogPrimitive.Close
        className={cn(
          // Position
          "absolute right-4 top-4",
          // Shape
          "flex h-7 w-7 items-center justify-center rounded-full",
          // Colors
          "bg-muted text-muted-foreground",
          // Hover
          "hover:bg-border hover:text-foreground",
          // Focus ring
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-card",
          // Transition — slight spring rotate on hover via CSS
          "transition-all duration-200 hover:scale-110 hover:rotate-90",
          "disabled:pointer-events-none",
        )}
      >
        <X className="h-3.5 w-3.5" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

// ── Header ────────────────────────────────────────────────────────────────────
const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className,
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

// ── Footer ────────────────────────────────────────────────────────────────────
const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

// ── Title ─────────────────────────────────────────────────────────────────────
const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-foreground",
      className,
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

// ── Description ───────────────────────────────────────────────────────────────
const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
