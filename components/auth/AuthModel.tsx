"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useStore } from "@tanstack/react-store";
import { z } from "zod";
import {
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
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
import { OtpStep, RegisterStep, SetPasswordStep } from "./Signup";
import { GoogleContactForm } from "./GoogleContactForm";

const googleContactSchema = z.object({
  phone: z
    .string()
    .min(1, "Phone is required")
    .regex(/^\+?[0-9\s\-]{7,15}$/, "Enter a valid phone number"),
  city: z.string().min(1, "City is required").min(2, "At least 2 characters"),
  bio: z.string().max(100, "Max 100 characters").optional(),
});

// ─── TYPES ────────────────────────────────────────────────────────────────────

type View =
  | "login"
  | "signup"
  | "google-contact"
  | "register"
  | "otp"
  | "set-password";

// ─── VIEW STATE ───────────────────────────────────────────────────────────────

export function useViewState(initial: View) {
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

// ─── STEP BAR ────────────────────────────────────────────────────────────────

const SIGNUP_STEPS = ["Details", "Verify", "Password"] as const;

export function SignupStepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center px-6 pb-2">
      {SIGNUP_STEPS.map((label, i) => {
        const isLast = i === SIGNUP_STEPS.length - 1;
        return (
          <div
            key={label}
            className={cn("flex items-center", !isLast && "flex-1")}
          >
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-300",
                  i < current && "bg-secondary text-secondary-foreground",
                  i === current &&
                    "bg-primary text-primary-foreground shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]",
                  i > current && "bg-muted text-muted-foreground",
                )}
              >
                {i < current ? <CheckCircle2 className="h-3 w-3" /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-[9px] font-semibold",
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

// ─── SIGNUP FLOW (orchestrates 3 steps) ──────────────────────────────────────

export function SignupFlow({
  switchView,
  isOrganizer,
}: {
  switchView: (v: View) => void;
  isOrganizer?: boolean;
}) {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [anim, setAnim] = useState(false);
  const [verificationIdx, setVerificationIdx] = useState("");
  const [userIdentifier, setUserIdentifier] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const goTo = (next: 0 | 1 | 2) => {
    setAnim(true);
    setTimeout(() => {
      setStep(next);
      setAnim(false);
    }, 200);
  };

  const handleRegisterDone = (idx: string, identifier: string) => {
    setVerificationIdx(idx);
    setUserIdentifier(identifier);
    goTo(1);
  };

  const handleOtpDone = (code: string) => {
    setOtpCode(code);
    goTo(2);
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        className={cn(
          "transition-all duration-[200ms] ease-[ease]",
          anim ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100",
        )}
      >
        {step === 0 && (
          <RegisterStep
            onNext={handleRegisterDone}
            currentStep={step}
            isOrganizer={isOrganizer}
          />
        )}
        {step === 1 && (
          <OtpStep
            verificationIdx={verificationIdx}
            userIdentifier={userIdentifier}
            onNext={handleOtpDone}
            onBack={() => goTo(0)}
            currentStep={step}
          />
        )}
        {step === 2 && (
          <SetPasswordStep
            verificationIdx={verificationIdx}
            userIdentifier={userIdentifier}
            otpCode={otpCode}
            onDone={() => switchView("login")}
            currentStep={step}
          />
        )}
      </div>

      {step === 0 && (
        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <button
            onClick={() => switchView("login")}
            className="font-bold text-primary hover:underline"
          >
            Log in
          </button>
        </p>
      )}
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
      <div
        className={cn(
          "h-[2.5px] w-full bg-gradient-to-r transition-all duration-500",
          accentClass,
        )}
      />
      <div
        className={cn(
          "px-7 pb-7 pt-5",
          "transition-all duration-[220ms] ease-[ease]",
          animating ? "translate-y-2.5 opacity-0" : "translate-y-0 opacity-100",
        )}
      >
        {view === "login" && (
          <LoginForm switchView={switchView} onSuccess={onClose} />
        )}
        {view === "signup" && <SignupFlow switchView={switchView} />}
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

  return (
    <>
      <div className="hidden items-center gap-3 md:flex">
        <Button variant="ghost" size="sm" onClick={() => openModal("login")}>
          {t("auth.login")}
        </Button>
        <Button size="sm" onClick={() => openModal("signup")}>
          {t("auth.getStarted")}
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
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
