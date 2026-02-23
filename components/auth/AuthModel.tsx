"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useStore } from "@tanstack/react-store";
import { z } from "zod";
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import GoogleIcon from "@/public/icons/GoogleIcon";
import StyledInput from "@/components/form/FormInput";
import FieldTextarea from "@/components/form/FieldTextarea";
import FieldError from "../form/FIeldError";
import { LoginForm } from "./login-signup";

// ─── SCHEMAS ─────────────────────────────────────────────────────────────────

const signupSchema = z.object({
  name: z.string().min(1, "Name is required").min(2, "At least 2 characters"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Minimum 8 characters")
    .regex(/[A-Z]/, "Include at least one uppercase letter")
    .regex(/[0-9]/, "Include at least one number"),
  terms: z.boolean().refine((v) => v === true, "You must accept the terms"),
});

const googleContactSchema = z.object({
  phone: z
    .string()
    .min(1, "Phone is required")
    .regex(/^\+?[0-9\s\-]{7,15}$/, "Enter a valid phone number"),
  city: z.string().min(1, "City is required").min(2, "At least 2 characters"),
  bio: z.string().max(100, "Max 100 characters").optional(),
});

// ─── TYPES ────────────────────────────────────────────────────────────────────

type View = "login" | "signup" | "google-contact";

// ─── VIEW STATE ───────────────────────────────────────────────────────────────

function useViewState(initial: View) {
  const [view, setView] = useState<View>(initial);
  const [animating, setAnimating] = useState(false);

  const switchView = (next: View) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setView(next);
      setAnimating(false);
    }, 220);
  };

  return { view, setView, animating, switchView };
}

// ─── SIGNUP FORM ──────────────────────────────────────────────────────────────

function SignupForm({ switchView }: { switchView: (v: View) => void }) {
  const form = useForm({
    defaultValues: { name: "", email: "", password: "", terms: false },
    validators: { onChange: signupSchema },
    onSubmit: async ({ value }) => {
      console.log("Signup:", value);
    },
  });

  const password = useStore(form.store, (s) => s.values.password);
  const { canSubmit, isSubmitting } = useStore(form.store, (s) => ({
    canSubmit: s.canSubmit,
    isSubmitting: s.isSubmitting,
  }));

  const strength = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const strengthLabel = ["Too weak", "Weak", "Fair", "Good", "Strong 💪"][
    strength
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/10 text-xl">
          🚀
        </div>
        <h2 className="font-heading text-xl font-bold text-foreground">
          Create account
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Join 50K+ members — it's free
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col gap-3.5"
      >
        <form.Field name="name">
          {(field) => (
            <StyledInput
              label="Full name"
              field={field}
              icon={User}
              placeholder="Aarav Karki"
            />
          )}
        </form.Field>

        <form.Field name="email">
          {(field) => (
            <StyledInput
              label="Email"
              field={field}
              icon={Mail}
              type="email"
              placeholder="you@example.com"
            />
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <StyledInput
              label="Password"
              field={field}
              icon={Lock}
              type="password"
              placeholder="Min. 8 characters"
            />
          )}
        </form.Field>

        {/* Password strength bar */}
        {password.length > 0 && (
          <div className="flex flex-col gap-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((l) => (
                <div
                  key={l}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-all duration-300",
                    strength >= l
                      ? l === 1
                        ? "bg-red-400"
                        : l === 2
                          ? "bg-amber-400"
                          : l === 3
                            ? "bg-secondary"
                            : "bg-green-500"
                      : "bg-muted",
                  )}
                />
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">{strengthLabel}</p>
          </div>
        )}

        {/* Terms */}
        <form.Field name="terms">
          {(field) => (
            <div className="flex flex-col gap-1">
              <label className="flex cursor-pointer items-start gap-2 text-[11px] text-muted-foreground">
                <input
                  type="checkbox"
                  className="mt-0.5 accent-secondary"
                  checked={Boolean(field.state.value)}
                  onChange={(e) => field.handleChange(e.target.checked as any)}
                  onBlur={field.handleBlur}
                />
                I agree to the{" "}
                <span className="cursor-pointer font-semibold text-primary hover:underline">
                  Terms
                </span>{" "}
                and{" "}
                <span className="cursor-pointer font-semibold text-primary hover:underline">
                  Privacy Policy
                </span>
              </label>
              <FieldError field={field} />
            </div>
          )}
        </form.Field>

        <Button
          type="submit"
          variant="secondary"
          disabled={!canSubmit || isSubmitting}
          className="w-full gap-2 rounded-xl py-5 font-bold"
        >
          {isSubmitting ? (
            "Creating…"
          ) : (
            <>
              {" "}
              Create account <ArrowRight className="h-4 w-4" />{" "}
            </>
          )}
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <button
          onClick={() => switchView("login")}
          className="font-bold text-primary hover:underline"
        >
          Log in
        </button>
      </p>
    </div>
  );
}

// ─── GOOGLE CONTACT FORM ──────────────────────────────────────────────────────

function GoogleContactForm({
  switchView,
  onClose,
}: {
  switchView: (v: View) => void;
  onClose: () => void;
}) {
  const [done, setDone] = useState(false);

  const form = useForm({
    defaultValues: { phone: "", city: "", bio: "" },
    validators: { onChange: googleContactSchema as any },
    onSubmit: async ({ value }) => {
      console.log("Google contact:", value);
      setDone(true);
      setTimeout(onClose, 1600);
    },
  });

  const { canSubmit, isSubmitting } = useStore(form.store, (s) => ({
    canSubmit: s.canSubmit,
    isSubmitting: s.isSubmitting,
  }));

  if (done) {
    return (
      <div
        className="flex flex-col items-center gap-4 py-8 text-center"
        style={{ animation: "scaleIn 0.4s cubic-bezier(0.34,1.5,0.64,1) both" }}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10">
          <CheckCircle2 className="h-8 w-8 text-secondary" />
        </div>
        <div>
          <p className="font-heading text-xl font-bold text-foreground">
            You're all set! 🎉
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Welcome to CaaS</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background shadow-sm">
          <GoogleIcon />
        </div>
        <h2 className="font-heading text-xl font-bold text-foreground">
          Complete profile
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          A few details to personalise your experience
        </p>
      </div>

      {/* Google account pill */}
      <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-3.5 py-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4285F4] text-[11px] font-bold text-white">
          G
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground">
            Signing in with Google
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            yourname@gmail.com
          </p>
        </div>
        <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-secondary" />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col gap-3.5"
      >
        <form.Field name="phone">
          {(field) => (
            <StyledInput
              label="Phone"
              field={field}
              icon={Phone}
              type="tel"
              placeholder="+977 98XXXXXXXX"
            />
          )}
        </form.Field>

        <form.Field name="city">
          {(field) => (
            <StyledInput
              label="City"
              field={field}
              icon={MapPin}
              placeholder="Kathmandu, Nepal"
            />
          )}
        </form.Field>

        <form.Field name="bio">
          {(field) => (
            <FieldTextarea
              field={field}
              label="Bio"
              optional
              placeholder="Tell the community a bit about yourself…"
            />
          )}
        </form.Field>

        <div className="flex gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-xl"
            onClick={() => switchView("login")}
          >
            Back
          </Button>
          <Button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="flex-1 gap-2 rounded-xl"
          >
            {isSubmitting ? (
              "Saving…"
            ) : (
              <>
                {" "}
                Continue <ArrowRight className="h-4 w-4" />{" "}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

// ─── MODAL CONTENT ────────────────────────────────────────────────────────────

function ModalContent({
  view,
  animating,
  switchView,
  onClose,
}: {
  view: View;
  animating: boolean;
  switchView: (v: View) => void;
  onClose: () => void;
}) {
  const accentClass =
    view === "login"
      ? "from-primary via-secondary to-accent"
      : view === "signup"
        ? "from-secondary via-accent to-primary"
        : "from-[#4285F4] via-[#34A853] to-[#FBBC05]";

  return (
    <>
      {/* Animated accent line */}
      <div
        className={cn(
          "h-[2.5px] w-full bg-gradient-to-r transition-all duration-500",
          accentClass,
        )}
      />

      {/* Animated content */}
      <div
        className={cn(
          "px-7 pb-7 pt-5",
          "transition-all duration-[220ms] ease-[ease]",
          animating ? "opacity-0 translate-y-2.5" : "opacity-100 translate-y-0",
        )}
      >
        {view === "login" && <LoginForm switchView={switchView} />}
        {view === "signup" && <SignupForm switchView={switchView} />}
        {view === "google-contact" && (
          <GoogleContactForm switchView={switchView} onClose={onClose} />
        )}
      </div>
    </>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

export default function AuthPopup() {
  const t = useTranslations("common");

  const [open, setOpen] = useState(false);
  const { view, setView, animating, switchView } = useViewState("login");

  const openModal = (v: View) => {
    setView(v);
    setOpen(true);
  };

  const handleOpenChange = (o: boolean) => {
    setOpen(o);
  };

  return (
    <>
      {/* Trigger buttons — live inside navbar */}
      <div className="hidden items-center gap-3 md:flex">
        <Button variant="ghost" size="sm" onClick={() => openModal("login")}>
          {t("auth.login")}
        </Button>
        <Button size="sm" onClick={() => openModal("signup")}>
          {t("auth.getStarted")}
        </Button>
      </div>

      {/* Dialog — Radix portal, never clipped by navbar stacking context */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="overflow-hidden rounded-3xl border border-border bg-card p-0 shadow-2xl sm:max-w-sm">
          <DialogTitle className="sr-only">
            {view === "login"
              ? "Sign in"
              : view === "signup"
                ? "Create account"
                : "Complete profile"}
          </DialogTitle>

          <ModalContent
            view={view}
            animating={animating}
            switchView={switchView}
            onClose={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
}
