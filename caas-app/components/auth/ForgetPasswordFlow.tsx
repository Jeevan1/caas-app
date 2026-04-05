"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, ArrowRight, Mail, Lock, CheckCircle2 } from "lucide-react";
import { useForm, useStore } from "@tanstack/react-form";
import { z } from "zod";
import { cn, useApiMutation } from "@/lib/utils";
import StyledInput from "../form/FormInput";
import { Button } from "../ui/button";

const identifierSchema = z.object({
  user_identifier: z.string().min(1, "Phone or email is required"),
});

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Minimum 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .superRefine(({ password, confirm_password }, ctx) => {
    if (password !== confirm_password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirm_password"],
      });
    }
  });

function StepBar({ step }: { step: 0 | 1 | 2 }) {
  const steps = ["Identify", "Verify", "Reset"];
  return (
    <div className="flex items-center px-6 pb-2">
      {steps.map((label, i) => {
        const isLast = i === steps.length - 1;
        return (
          <div
            key={label}
            className={cn("flex items-center", !isLast && "flex-1")}
          >
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-300",
                  i < step && "bg-secondary text-secondary-foreground",
                  i === step &&
                    "bg-primary text-primary-foreground shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]",
                  i > step && "bg-muted text-muted-foreground",
                )}
              >
                {i < step ? <CheckCircle2 className="h-3 w-3" /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-[9px] font-semibold",
                  i === step ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  "mx-2 mb-4 h-px flex-1 transition-all duration-500",
                  i < step ? "bg-secondary" : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function IdentifyStep({
  onNext,
}: {
  onNext: (verificationIdx: string, userIdentifier: string) => void;
}) {
  const [serverError, setServerError] = useState("");

  const { mutate, isPending } = useApiMutation({
    apiPath: "/api/autho/account_recovery/send_otp_uid/",
    method: "POST",
    onSuccessCallback: (data, payload: any) => {
      onNext(data.recovery?.idx ?? data.idx, payload.user_identifier);
    },
    onErrorCallback(err) {
      setServerError(err.message);
    },
    successMessage: "OTP sent successfully",
  });

  const form = useForm({
    defaultValues: { user_identifier: "" },
    validators: { onChange: identifierSchema as any },
    onSubmit: ({ value }) => {
      setServerError("");
      mutate({ user_identifier: value.user_identifier });
    },
  });

  const { canSubmit, isSubmitting } = useStore(form.store, (s) => ({
    canSubmit: s.canSubmit,
    isSubmitting: s.isSubmitting,
  }));

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-xl">
          🔑
        </div>
        <h2 className="font-heading text-xl font-bold text-foreground">
          Forgot password?
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Enter your phone number or email and we'll send you a verification
          code.
        </p>
      </div>

      <StepBar step={0} />

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
              label="Phone or email"
              field={field}
              icon={Mail}
              type="text"
              placeholder="+977 98XXXXXXXX or you@example.com"
            />
          )}
        </form.Field>

        {serverError && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
            {serverError}
          </p>
        )}

        <Button
          type="submit"
          disabled={!canSubmit || isSubmitting || isPending}
          className="sub-btn mt-1 w-full gap-2"
        >
          {isSubmitting || isPending ? (
            "Sending code…"
          ) : (
            <>
              Send verification code{" "}
              <ArrowRight className="h-4 w-4 sub-arrow" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

function OtpStep({
  verificationIdx,
  userIdentifier,
  onNext,
  onBack,
}: {
  verificationIdx: string;
  userIdentifier: string;
  onNext: (otp: string) => void;
  onBack: () => void;
}) {
  const [otp, setOtp] = useState("");
  const [serverError, setServerError] = useState("");
  const otpRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    otpRef.current?.focus();
  }, []);

  const { mutate, isPending } = useApiMutation({
    apiPath: `/api/autho/account_recovery/check_otp/`,
    method: "POST",
    onSuccessCallback: () => {
      onNext(otp);
    },
    onErrorCallback(err) {
      setServerError(err.message);
    },
    payloadTransform: (payload: any) => ({
      otp: verificationIdx,
      code: payload.code,
    }),
    successMessage: "OTP verified successfully",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) return;
    setServerError("");
    mutate({ code: otp });
  };

  const digits = otp.padEnd(6, " ").split("");

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 border border-orange-100 text-xl">
          🔐
        </div>
        <h2 className="font-heading text-xl font-bold text-foreground">
          Check your messages
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          We sent a 6-digit code to{" "}
          <span className="font-semibold text-foreground">
            {userIdentifier}
          </span>
        </p>
      </div>

      <StepBar step={1} />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground text-center">
            Verification Code
          </label>

          <div className="relative" onClick={() => otpRef.current?.focus()}>
            <input
              ref={otpRef}
              type="tel"
              inputMode="numeric"
              value={otp}
              maxLength={6}
              disabled={isPending}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                if (serverError) setServerError("");
              }}
              className="absolute inset-0 opacity-0 cursor-text z-10 w-full"
              aria-label="OTP code"
            />
            <div className="flex gap-2 justify-center">
              {digits.map((d, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-12 w-10 rounded-xl border-2 flex items-center justify-center text-lg font-bold transition-all",
                    i === otp.length
                      ? "border-orange-400 bg-orange-50 shadow-[0_0_0_3px_rgba(251,146,60,0.15)]"
                      : d.trim()
                        ? "border-gray-300 bg-white dark:border-zinc-600 dark:bg-zinc-800"
                        : "border-gray-200 bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900",
                  )}
                >
                  {d.trim()}
                </div>
              ))}
            </div>
          </div>

          {serverError && (
            <p className="text-[11px] text-red-500 text-center">
              {serverError}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onBack}
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-border bg-muted/30 py-3 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <button
            type="submit"
            disabled={isPending || otp.length < 6}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {isPending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />{" "}
                Checking…
              </>
            ) : (
              <>
                Verify <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>

      <p className="text-center text-[11px] text-muted-foreground">
        Didn't receive it?{" "}
        <button
          type="button"
          className="font-semibold text-primary hover:underline"
          onClick={() => {
            /* re-send logic — call send_otp_uid again with userIdentifier */
          }}
        >
          Resend code
        </button>
      </p>
    </div>
  );
}

function ResetPasswordStep({
  verificationIdx,
  userIdentifier,
  otpCode,
  onSuccess,
  onBack,
}: {
  verificationIdx: string;
  userIdentifier: string;
  otpCode: string;
  onSuccess: () => void;
  onBack: () => void;
}) {
  const [serverError, setServerError] = useState("");
  const [done, setDone] = useState(false);

  // Capture password before transform
  const passwordRef = useRef("");

  const { mutate, isPending } = useApiMutation({
    apiPath: `/api/autho/account_recovery/${verificationIdx}/verify_otp/`,
    method: "POST",
    payloadTransform: (payload: any) => {
      passwordRef.current = payload.password;
      return {
        new_password: payload.password,
        otp_code: otpCode,
        user_identifier: userIdentifier,
        for_account_verification: false,
      };
    },
    successMessage: "Password reset successfully. Please login to continue.",
    onSuccessCallback: () => {
      setDone(true);
      setTimeout(onSuccess, 1800);
    },
    onErrorCallback(err) {
      setServerError(err.message);
    },
  });

  const form = useForm({
    defaultValues: { password: "", confirm_password: "" },
    validators: { onChange: passwordSchema as any },
    onSubmit: ({ value }) => mutate(value),
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

  if (done) {
    return (
      <div
        className="flex flex-col items-center gap-4 py-10 text-center"
        style={{ animation: "scaleIn 0.4s cubic-bezier(0.34,1.5,0.64,1) both" }}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/40">
          <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <p className="font-heading text-xl font-bold text-foreground">
            Password reset! 🎉
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            You can now sign in with your new password.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-xl">
          🔒
        </div>
        <h2 className="font-heading text-xl font-bold text-foreground">
          Create new password
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Choose a strong password you haven't used before.
        </p>
      </div>

      <StepBar step={2} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col gap-3.5"
      >
        <form.Field name="password">
          {(field) => (
            <StyledInput
              label="New password"
              field={field}
              icon={Lock}
              type="password"
              placeholder="Min. 8 characters"
            />
          )}
        </form.Field>

        <form.Field name="confirm_password">
          {(field) => (
            <StyledInput
              label="Confirm password"
              field={field}
              icon={Lock}
              type="password"
              placeholder="Repeat password"
            />
          )}
        </form.Field>

        {/* Strength bar */}
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

        {serverError && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
            {serverError}
          </p>
        )}

        <div className="flex gap-2 mt-1">
          <button
            type="button"
            onClick={onBack}
            disabled={isPending}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <Button
            type="submit"
            disabled={!canSubmit || isSubmitting || isPending}
            className="sub-btn flex-1 gap-2"
          >
            {isSubmitting || isPending ? (
              "Saving…"
            ) : (
              <>
                Reset password <ArrowRight className="h-4 w-4 sub-arrow" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

type ForgotStep = "identify" | "otp" | "reset";

export function ForgotPasswordFlow({
  onBack,
  onSuccess,
}: {
  onBack: () => void;
  onSuccess?: () => void;
}) {
  const [step, setStep] = useState<ForgotStep>("identify");
  const [verificationIdx, setVerificationIdx] = useState("");
  const [userIdentifier, setUserIdentifier] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [animating, setAnimating] = useState(false);

  const transition = (next: ForgotStep) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setStep(next);
      setAnimating(false);
    }, 200);
  };

  const handleIdentified = (idx: string, identifier: string) => {
    setVerificationIdx(idx);
    setUserIdentifier(identifier);
    transition("otp");
  };

  const handleOtpVerified = (otp: string) => {
    setOtpCode(otp);
    transition("reset");
  };

  return (
    <div
      className={cn(
        "transition-all duration-200",
        animating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0",
      )}
    >
      {step === "identify" && (
        <>
          <IdentifyStep onNext={handleIdentified} />
          <p className="mt-5 text-center text-xs text-muted-foreground">
            Remember your password?{" "}
            <button
              type="button"
              onClick={onBack}
              className="font-bold text-primary hover:underline"
            >
              Sign in
            </button>
          </p>
        </>
      )}

      {step === "otp" && (
        <OtpStep
          verificationIdx={verificationIdx}
          userIdentifier={userIdentifier}
          onNext={handleOtpVerified}
          onBack={() => transition("identify")}
        />
      )}

      {step === "reset" && (
        <ResetPasswordStep
          verificationIdx={verificationIdx}
          userIdentifier={userIdentifier}
          otpCode={otpCode}
          onBack={() => transition("otp")}
          onSuccess={() => {
            onSuccess?.();
            onBack();
          }}
        />
      )}
    </div>
  );
}
