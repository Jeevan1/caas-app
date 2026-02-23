"use client";

import { useState, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { useStore } from "@tanstack/react-store";
import { z } from "zod";
import {
  ArrowRight,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  X,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import FieldError from "../form/FIeldError";
import GoogleIcon from "@/public/icons/GoogleIcon";
import StyledInput from "../form/FormInput";
import { cn, useApiMutation } from "@/lib/utils";
import { Button } from "../ui/button";
import FieldTextarea from "../form/FieldTextarea";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "@/i18n/navigation";

// ─── ZOD SCHEMAS ─────────────────────────────────────────────────────────────

const loginSchema = z.object({
  user_identifier: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Minimum 8 characters"),
});

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

// ─── SHARED UI ────────────────────────────────────────────────────────────────

type View = "login" | "signup" | "google-contact";

// ─── LOGIN FORM ───────────────────────────────────────────────────────────────
export function LoginForm({ switchView }: { switchView: (v: View) => void }) {
  const router = useRouter();
  const form = useForm({
    defaultValues: { user_identifier: "", password: "" },
    validators: {
      onChange: loginSchema,
    },
    onSubmit: async ({ value }) => {
      // ✅ Fully typed & validated. Replace with your API call.
      console.log("Login submit:", value);
      await login(value);
    },
  });

  const { mutateAsync: login, isPending } = useApiMutation({
    apiPath: "/api/autho/create-token/",
    method: "POST",
    queryKey: "login",
    onSuccessCallback(data, payload) {
      toast({
        title: "Success",
        description: "You have successfully logged in",
        duration: 5000,
        variant: "default",
      });
      router.refresh();
    },
  });

  // Read reactive state via useStore (standalone import) — v1 correct API
  const { canSubmit, isSubmitting } = useStore(form.store, (s) => ({
    canSubmit: s.canSubmit,
    isSubmitting: s.isSubmitting,
  }));

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-xl">
          👋
        </div>
        <h2 className="font-heading text-xl font-bold text-foreground">
          Welcome back
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Sign in to your account
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
        <form.Field name="user_identifier">
          {(field) => (
            <StyledInput
              label="Email/Phone"
              field={field}
              icon={Mail}
              type="text"
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
              placeholder="••••••••"
            />
          )}
        </form.Field>

        <div className="flex justify-end">
          <button
            type="button"
            className="text-[11px] font-semibold text-primary hover:underline"
          >
            Forgot password?
          </button>
        </div>

        <Button
          type="submit"
          disabled={!canSubmit || isSubmitting || isPending}
          className="sub-btn mt-1"
        >
          {isSubmitting ? (
            "Signing in…"
          ) : (
            <>
              {" "}
              Sign in <ArrowRight className="h-4 w-4 sub-arrow" />{" "}
            </>
          )}
        </Button>
      </form>

      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-border/60" />
        <span className="text-[10px] font-medium text-muted-foreground">
          or
        </span>
        <div className="h-px flex-1 bg-border/60" />
      </div>

      <button
        type="button"
        onClick={() => switchView("google-contact")}
        className="google-btn flex w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-background py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
      >
        <GoogleIcon /> Continue with Google
      </button>

      <p className="text-center text-xs text-muted-foreground">
        Don't have an account?{" "}
        <button
          onClick={() => switchView("signup")}
          className="font-bold text-primary hover:underline"
        >
          Sign up free
        </button>
      </p>
    </div>
  );
}

// ─── SIGNUP FORM ──────────────────────────────────────────────────────────────
function SignupForm({ switchView }: { switchView: (v: View) => void }) {
  const form = useForm({
    defaultValues: { name: "", email: "", password: "", terms: false },
    validators: {
      onChange: signupSchema,
    },
    onSubmit: async ({ value }) => {
      // ✅ Replace with your API call.
      console.log("Signup submit:", value);
    },
  });

  // useStore (standalone) to reactively read password for the strength bar
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
              label="Name"
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

        {/* Password strength bar — driven by live password value */}
        {password.length > 0 && (
          <div className="flex flex-col gap-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((l) => (
                <div
                  key={l}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    strength >= l
                      ? l === 1
                        ? "bg-primary"
                        : l === 2
                          ? "bg-amber-400"
                          : l === 3
                            ? "bg-secondary"
                            : "bg-green-400"
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">{strengthLabel}</p>
          </div>
        )}

        {/* Terms checkbox */}
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
          variant={"secondary"}
          disabled={!canSubmit || isSubmitting}
          className="sub-btn-2 mt-1 flex w-full"
        >
          {isSubmitting ? (
            "Creating…"
          ) : (
            <>
              {" "}
              Create account <ArrowRight className="h-4 w-4 sub-arrow-2" />{" "}
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
  onSuccess,
}: {
  switchView: (v: View) => void;
  onSuccess?: () => void;
}) {
  const [done, setDone] = useState(false);

  const form = useForm({
    defaultValues: { phone: "", city: "", bio: "" },
    validators: {
      onChange: googleContactSchema as any,
    },
    onSubmit: async ({ value }) => {
      // ✅ Replace with your API call.
      console.log("Google contact submit:", value);
      setDone(true);
      if (onSuccess) setTimeout(onSuccess, 1600);
    },
  });

  const bio = useStore(form.store, (s) => s.values.bio ?? "");
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
              label="Phone number"
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
              placeholder="A few words about yourself"
            />
          )}
        </form.Field>

        <div className="flex gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={() => switchView("login")}
            className="flex-1 sub-btn"
          >
            Back
          </Button>
          <Button
            type="submit"
            variant={"default"}
            disabled={!canSubmit || isSubmitting}
            className="sub-btn flex flex-1"
          >
            {isSubmitting ? (
              "Saving…"
            ) : (
              <>
                {" "}
                Continue <ArrowRight className="h-4 w-4 sub-arrow" />{" "}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

// ─── FORM CONTENT WRAPPER ─────────────────────────────────────────────────────
function FormContent({
  view,
  animating,
  switchView,
  onSuccess,
}: {
  view: View;
  animating: boolean;
  switchView: (v: View) => void;
  onSuccess?: () => void;
}) {
  const accentClass =
    view === "login"
      ? "from-primary via-secondary to-accent"
      : view === "signup"
        ? "from-secondary via-accent to-primary"
        : "from-[#4285F4] via-[#34A853] to-[#FBBC05]";

  return (
    <>
      <div
        className={`h-[2.5px] w-full bg-gradient-to-r transition-all duration-500 ${accentClass}`}
      />
      <div
        className={cn(
          "px-7 pb-7 pt-6",
          "transition-all duration-[220ms] ease-[ease]",
          animating ? "opacity-0 translate-y-2.5" : "opacity-100 translate-y-0",
        )}
      >
        {view === "login" && <LoginForm switchView={switchView} />}
        {view === "signup" && <SignupForm switchView={switchView} />}
        {view === "google-contact" && (
          <GoogleContactForm switchView={switchView} onSuccess={onSuccess} />
        )}
      </div>
    </>
  );
}

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

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export default function AuthSection({ page }: { page: string }) {
  const isInline = page === "login" || page === "signup";
  const initialView: View = page === "signup" ? "signup" : "login";

  const inline = useViewState(initialView);
  const popup = useViewState("login");

  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  const openModal = (v: View = "login") => {
    popup.setView(v);
    setOpen(true);
    setTimeout(() => setVisible(true), 10);
  };

  const closeModal = () => {
    setVisible(false);
    setTimeout(() => setOpen(false), 320);
  };

  useEffect(() => {
    if (isInline) return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, isInline]);

  useEffect(() => {
    if (isInline) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [isInline]);

  const css = `
    @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
    @keyframes scaleIn { from{opacity:0;transform:scale(0.8)} to{opacity:1;transform:scale(1)} }
    .trigger-btn { transition:transform .2s cubic-bezier(.34,1.4,.64,1),box-shadow .2s ease,border-color .2s ease; }
    .trigger-btn:hover { transform:translateY(-2px); box-shadow:0 6px 20px -4px hsl(var(--foreground)/.08); }
    .trigger-btn-primary { transition:transform .2s cubic-bezier(.34,1.4,.64,1),box-shadow .2s ease; }
    .trigger-btn-primary:hover { transform:translateY(-2px); box-shadow:0 10px 28px -4px hsl(var(--primary)/.35); }
    .trigger-arrow { transition:transform .18s ease; }
    .trigger-btn-primary:hover .trigger-arrow { transform:translateX(4px); }
    .close-btn { transition:transform .2s cubic-bezier(.34,1.5,.64,1),background .15s ease; }
    .close-btn:hover { transform:scale(1.12) rotate(8deg); }
    .sub-btn { transition:transform .2s cubic-bezier(.34,1.56,.64,1),box-shadow .2s ease; }
    .sub-btn:not(:disabled):hover { transform:translateY(-1px) scale(1.01); box-shadow:0 8px 24px -4px hsl(var(--primary)/.35); }
    .sub-arrow { transition:transform .18s ease; }
    .sub-btn:hover .sub-arrow { transform:translateX(3px); }
    .sub-btn-2 { transition:transform .2s cubic-bezier(.34,1.56,.64,1),box-shadow .2s ease; }
    .sub-btn-2:not(:disabled):hover { transform:translateY(-1px) scale(1.01); box-shadow:0 8px 24px -4px hsl(var(--secondary)/.35); }
    .sub-arrow-2 { transition:transform .18s ease; }
    .sub-btn-2:hover .sub-arrow-2 { transform:translateX(3px); }
    .google-btn { transition:transform .18s cubic-bezier(.34,1.4,.64,1),box-shadow .18s ease; }
    .google-btn:hover { transform:translateY(-1px); box-shadow:0 4px 16px -4px hsl(var(--foreground)/.1); }
  `;

  const decorBg = (
    <>
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(hsl(var(--foreground)) 1.5px, transparent 1.5px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="pointer-events-none fixed -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-primary/8 blur-3xl" />
      <div className="pointer-events-none fixed -right-40 -bottom-40 h-[500px] w-[500px] rounded-full bg-secondary/8 blur-3xl" />
    </>
  );

  // ── INLINE ───────────────────────────────────────────────────────────────
  if (isInline) {
    return (
      <>
        <div className="relative flex min-h-[calc(100vh-4.5rem)] items-center justify-center bg-background px-4 py-12">
          {decorBg}
          <div
            className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
            style={{
              animation: "fadeUp 0.55s cubic-bezier(0.34,1.1,0.64,1) both",
            }}
          >
            <FormContent {...inline} />
          </div>
        </div>
        <style>{css}</style>
      </>
    );
  }

  // ── POPUP ────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="flex min-h-[calc(100vh-4.5rem)] flex-col items-center justify-center gap-6 bg-background px-4">
        {decorBg}

        <div
          className="relative text-center"
          style={{ animation: "fadeUp 0.7s ease both" }}
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            CaaS Platform
          </h1>
          <p className="mt-3 text-muted-foreground">
            Campaigns as a Service — launch, grow, connect.
          </p>
        </div>

        <div
          className="flex flex-wrap justify-center gap-3"
          style={{ animation: "fadeUp 0.7s ease 0.12s both" }}
        >
          <button
            onClick={() => openModal("login")}
            className="trigger-btn flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground shadow-sm hover:border-primary/30 hover:shadow-md"
          >
            Log in
          </button>
          <button
            onClick={() => openModal("signup")}
            className="trigger-btn-primary flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md"
          >
            Get started free <ArrowRight className="h-4 w-4 trigger-arrow" />
          </button>
        </div>

        <p
          className="text-xs text-muted-foreground"
          style={{ animation: "fadeUp 0.7s ease 0.22s both" }}
        >
          Join 50,000+ members · Free to start
        </p>
      </div>

      {open && (
        <>
          <div
            className="fixed inset-0 z-50 bg-foreground/25 backdrop-blur-sm"
            style={{
              transition: "opacity 0.3s ease",
              opacity: visible ? 1 : 0,
            }}
            onClick={closeModal}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
              style={{
                transition:
                  "opacity 0.32s ease, transform 0.32s cubic-bezier(0.34,1.3,0.64,1)",
                opacity: visible ? 1 : 0,
                transform: visible
                  ? "translateY(0) scale(1)"
                  : "translateY(32px) scale(0.95)",
              }}
            >
              <button
                type="button"
                onClick={closeModal}
                className="close-btn absolute right-4 top-4 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-border hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <FormContent {...popup} onSuccess={closeModal} />
            </div>
          </div>
        </>
      )}

      <style>{css}</style>
    </>
  );
}
