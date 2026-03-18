"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useStore } from "@tanstack/react-store";
import { z } from "zod";
import {
  Lock,
  KeyRound,
  Save,
  Loader2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import StyledInput from "@/components/form/FormInput";
import { cn, useApiMutation } from "@/lib/utils";
import { useCurrentUser } from "@/lib/providers";
import { hasPermission } from "@/lib/permissions/has-permissions";

const step1Schema = z.object({
  old_password: z.string().min(1, "Current password is required"),
});

const step2Schema = z.object({
  otp: z.string().min(4, "Enter the OTP").max(8),
});

const step3Schema = z
  .object({
    new_password: z
      .string()
      .min(8, "Minimum 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .superRefine(({ new_password, confirm_password }, ctx) => {
    if (new_password !== confirm_password)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirm_password"],
      });
  });

type Step = 1 | 2 | 3 | 4;

// ─── STRENGTH METER ───────────────────────────────────────────────────────────

function StrengthMeter({ password }: { password: string }) {
  if (!password.length) return null;
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const strength = checks.filter(Boolean).length;
  const labels = ["", "Weak", "Fair", "Good", "Strong 💪"];
  const colors = [
    "",
    "bg-red-400",
    "bg-amber-400",
    "bg-secondary",
    "bg-green-500",
  ];

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((l) => (
          <div
            key={l}
            className={cn(
              "h-1 flex-1 rounded-full transition-all duration-300",
              strength >= l ? colors[strength] : "bg-muted",
            )}
          />
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground">{labels[strength]}</p>
    </div>
  );
}

// ─── STEP INDICATOR ───────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: Step }) {
  if (step === 4) return null;
  const steps = ["Current", "Verify OTP", "New password"];
  return (
    <div className="flex items-center gap-2 mb-5">
      {steps.map((label, i) => {
        const s = (i + 1) as Step;
        const done = step > s;
        const active = step === s;
        return (
          <div
            key={s}
            className={cn(
              "flex items-center",
              i < steps.length - 1 && "flex-1",
            )}
          >
            <div className="flex flex-col items-center gap-0.5">
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-300",
                  done && "bg-secondary text-secondary-foreground",
                  active &&
                    "bg-primary text-primary-foreground shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]",
                  !done && !active && "bg-muted text-muted-foreground",
                )}
              >
                {done ? <CheckCircle2 className="h-3 w-3" /> : s}
              </div>
              <span
                className={cn(
                  "text-[9px] font-semibold whitespace-nowrap",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "mx-1.5 mb-3.5 h-px flex-1 transition-all duration-500",
                  done ? "bg-secondary" : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export function ChangePassword() {
  const user = useCurrentUser();

  const hasPerms = hasPermission(user, [
    "user_management-change-password:post",
  ]);
  if (!hasPerms) return null;

  const [step, setStep] = useState<Step>(1);
  const [recoveryIdx, setRecoveryIdx] = useState("");
  const [anim, setAnim] = useState(false);

  const goTo = (next: Step) => {
    setAnim(true);
    setTimeout(() => {
      setStep(next);
      setAnim(false);
    }, 200);
  };

  // ── Step 1: send OTP ────────────────────────────────────────────────────

  const { mutateAsync: sendOtp, isPending: sending } = useApiMutation({
    apiPath: "/api/autho/account_recovery/send_otp_password/",
    method: "POST",
  });

  const form1 = useForm({
    defaultValues: { old_password: "" },
    validators: { onChange: step1Schema as any },
    onSubmit: async ({ value }) => {
      const data: any = await sendOtp({ old_password: value.old_password });
      setRecoveryIdx(data?.recovery?.idx ?? "");
      goTo(2);
    },
  });

  // ── Step 2: verify OTP ──────────────────────────────────────────────────

  const { mutateAsync: verifyOtp, isPending: verifying } = useApiMutation({
    apiPath: `/api/autho/account_recovery/${recoveryIdx}/verify_otp/`,
    method: "POST",
  });

  const form2 = useForm({
    defaultValues: { otp: "" },
    validators: { onChange: step2Schema as any },
    onSubmit: async ({ value }) => {
      // verify OTP — API just confirms it's valid, sets session
      await verifyOtp({ otp: value.otp });
      goTo(3);
    },
  });

  // ── Step 3: set new password ────────────────────────────────────────────

  const { mutateAsync: setNewPassword, isPending: saving } = useApiMutation({
    apiPath: `/api/autho/account_recovery/${recoveryIdx}/verify_otp/`,
    method: "POST",
  });

  const form3 = useForm({
    defaultValues: { new_password: "", confirm_password: "" },
    validators: { onChange: step3Schema as any },
    onSubmit: async ({ value }) => {
      await setNewPassword({ new_password: value.new_password });
      goTo(4);
    },
  });

  const newPw = useStore(form3.store, (s) => s.values.new_password);

  const s1 = useStore(form1.store, (s) => ({
    canSubmit: s.canSubmit,
    isSubmitting: s.isSubmitting,
  }));
  const s2 = useStore(form2.store, (s) => ({
    canSubmit: s.canSubmit,
    isSubmitting: s.isSubmitting,
  }));
  const s3 = useStore(form3.store, (s) => ({
    canSubmit: s.canSubmit,
    isSubmitting: s.isSubmitting,
  }));

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4">
      <StepIndicator step={step} />

      <div
        className={cn(
          "transition-all duration-[200ms] ease-[ease]",
          anim ? "translate-y-1.5 opacity-0" : "translate-y-0 opacity-100",
        )}
      >
        {/* ── STEP 1 ── */}
        {step === 1 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form1.handleSubmit();
            }}
            className="flex flex-col gap-4"
          >
            <form1.Field name="old_password">
              {(f) => (
                <StyledInput
                  field={f}
                  label="Current password"
                  type="password"
                  placeholder="Enter your current password"
                  icon={Lock}
                />
              )}
            </form1.Field>

            <Button
              type="submit"
              disabled={!s1.canSubmit || s1.isSubmitting || sending}
              className="gap-2 rounded-xl font-bold"
            >
              {s1.isSubmitting || sending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Sending OTP…
                </>
              ) : (
                <>
                  {" "}
                  Send verification code <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form2.handleSubmit();
            }}
            className="flex flex-col gap-4"
          >
            {/* Info banner */}
            <div className="flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                We sent an OTP to your registered mobile and email. Enter it
                below to continue.
              </p>
            </div>

            <form2.Field name="otp">
              {(f) => (
                <StyledInput
                  field={f}
                  label="One-time password (OTP)"
                  type="text"
                  placeholder="Enter OTP"
                  icon={KeyRound}
                />
              )}
            </form2.Field>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="gap-1.5 rounded-xl text-xs"
                disabled={sending}
                onClick={() => {
                  // Re-send OTP using the same old_password from form1
                  const oldPw = form1.getFieldValue("old_password" as any);
                  sendOtp({ old_password: oldPw }).then((data: any) => {
                    setRecoveryIdx(data?.recovery?.idx ?? "");
                  });
                }}
              >
                {sending ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" /> Resending…
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3" /> Resend OTP
                  </>
                )}
              </Button>

              <Button
                type="submit"
                disabled={!s2.canSubmit || s2.isSubmitting || verifying}
                className="flex-1 gap-2 rounded-xl font-bold"
              >
                {s2.isSubmitting || verifying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Verifying…
                  </>
                ) : (
                  <>
                    Verify OTP <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form3.handleSubmit();
            }}
            className="flex flex-col gap-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <form3.Field name="new_password">
                  {(f) => (
                    <StyledInput
                      field={f}
                      label="New password"
                      type="password"
                      placeholder="Min. 8 characters"
                      icon={KeyRound}
                    />
                  )}
                </form3.Field>
                <StrengthMeter password={newPw} />
              </div>

              <form3.Field name="confirm_password">
                {(f) => (
                  <StyledInput
                    field={f}
                    label="Confirm new password"
                    type="password"
                    placeholder="Repeat new password"
                    icon={KeyRound}
                  />
                )}
              </form3.Field>
            </div>

            <Button
              type="submit"
              disabled={!s3.canSubmit || s3.isSubmitting || saving}
              className="gap-2 rounded-xl font-bold"
            >
              {s3.isSubmitting || saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Update password
                </>
              )}
            </Button>
          </form>
        )}

        {/* ── SUCCESS ── */}
        {step === 4 && (
          <div className="flex flex-col items-center gap-4 py-6 text-center animate-in zoom-in-95 fade-in duration-400">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-secondary/20 [animation-duration:1.5s]" />
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10">
                <CheckCircle2 className="h-8 w-8 text-secondary" />
              </div>
            </div>
            <div>
              <p className="font-semibold text-foreground">Password updated!</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Your password has been changed successfully.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl text-xs"
              onClick={() => goTo(1)}
            >
              Change again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
