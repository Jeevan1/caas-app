"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { LoginForm } from "./login-signup";
import { OtpStep, RegisterStep, SetPasswordStep } from "./Signup";
import { GoogleContactForm } from "./GoogleContactForm";

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

// ─── SIGNUP FLOW ──────────────────────────────────────────────────────────────

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
            onNext={(idx, identifier) => {
              setVerificationIdx(idx);
              setUserIdentifier(identifier);
              goTo(1);
            }}
            currentStep={step}
            isOrganizer={isOrganizer}
          />
        )}
        {step === 1 && (
          <OtpStep
            verificationIdx={verificationIdx}
            userIdentifier={userIdentifier}
            onNext={(code) => {
              setOtpCode(code);
              goTo(2);
            }}
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

export function ModalContent({
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
  const router = useRouter();

  const handleLoginSuccess = () => {
    onClose();
  };

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
          "px-7 pb-7 pt-5 transition-all duration-[220ms] ease-[ease]",
          animating ? "translate-y-2.5 opacity-0" : "translate-y-0 opacity-100",
        )}
      >
        {view === "login" && (
          <LoginForm switchView={switchView} onSuccess={handleLoginSuccess} />
        )}
        {view === "signup" && <SignupFlow switchView={switchView} />}
        {view === "google-contact" && (
          <GoogleContactForm switchView={switchView} onClose={onClose} />
        )}
      </div>
    </>
  );
}

// ─── CONTROLLED DIALOG ───────────────────────────────────────────────────────
// Use this when you need to open the auth dialog imperatively (e.g. from
// JoinEvent or a Follow button) without rendering the navbar buttons.
//
// Usage:
//   const [authOpen, setAuthOpen] = useState(false);
//   <AuthDialog open={authOpen} onOpenChange={setAuthOpen} defaultView="login" />

export function AuthDialog({
  open,
  onOpenChange,
  defaultView = "login",
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  defaultView?: View;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { view, animating, switchView } = useViewState(defaultView);

  // Called when dialog is dismissed (X button, backdrop click, etc.)
  // router.refresh() is NOT needed here — it fires in ModalContent.handleLoginSuccess
  // right after the login API sets the cookie.
  const handleClose = () => {
    onOpenChange(false);
    queryClient.invalidateQueries({ queryKey: ["me"] });
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (!o) handleClose();
          else onOpenChange(true);
        }}
      >
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
            onClose={handleClose}
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

// ─── STANDALONE (navbar usage) ────────────────────────────────────────────────

export default function AuthPopup() {
  const t = useTranslations("common");
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const { view, setView, animating, switchView } = useViewState("login");

  const openModal = (v: View) => {
    setView(v);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    queryClient.invalidateQueries({ queryKey: ["me"] });
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

      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (!o) handleClose();
          else setOpen(true);
        }}
      >
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
            onClose={handleClose}
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
