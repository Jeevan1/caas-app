// ─── STEP 0 — REGISTER ───────────────────────────────────────────────────────

import {
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";
import { Button } from "../ui/button";
import StyledInput from "@/components/form/FormInput";
import { useForm, useStore } from "@tanstack/react-form";
import { useState } from "react";
import { cn, useApiMutation } from "@/lib/utils";
import FieldError from "../form/FIeldError";
import z from "zod";
import AuthHeader from "./AuthHeader";
import { SignupStepBar } from "./AuthModel";

// ─── SCHEMAS ─────────────────────────────────────────────────────────────────

const registerSchema = z.object({
  name: z.string().min(1, "Name is required").min(2, "At least 2 characters"),
  user_identifier: z.string().min(1, "Phone or email is required"),
  gender: z.string().optional(),
});

const otpSchema = z.object({
  code: z.string().min(4, "Enter the OTP code").max(8, "OTP too long"),
});

const passwordSchema = z.object({
  new_password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Minimum 8 characters")
    .regex(/[A-Z]/, "Include at least one uppercase letter")
    .regex(/[0-9]/, "Include at least one number"),
});

export function RegisterStep({
  onNext,
  currentStep,
  isOrganizer = false,
}: {
  onNext: (verificationIdx: string, userIdentifier: string) => void;
  currentStep: number;
  isOrganizer?: boolean;
}) {
  const [serverError, setServerError] = useState("");

  const form = useForm({
    defaultValues: {
      name: "",
      user_identifier: "",
      gender: "",
    },
    validators: { onChange: registerSchema as any },
    onSubmit: ({ value }) => {
      const payload = isOrganizer
        ? { name: value.name, user_identifier: value.user_identifier }
        : value;
      mutate(value);
    },
  });

  const { mutate, isPending } = useApiMutation<{ user_identifier: string }>({
    apiPath: isOrganizer
      ? "/api/autho/user-management/register-organizer/"
      : "/api/autho/user-management/register/",
    method: "POST",
    onSuccessCallback: (data, payload) => {
      if (payload) {
        onNext(data.verification.idx, payload.user_identifier);
      }
    },
    onErrorCallback(err) {
      setServerError(err.message);
    },
  });

  const { canSubmit, isSubmitting } = useStore(form.store, (s) => ({
    canSubmit: s.canSubmit,
    isSubmitting: s.isSubmitting,
  }));

  return (
    <div className="flex flex-col gap-4">
      <AuthHeader
        icon={"🚀"}
        title={`${isOrganizer ? "Register as Organizer" : "Create your account"}`}
      >
        <span></span>
      </AuthHeader>
      <SignupStepBar current={currentStep} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col gap-3.5 mt-2"
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

        <form.Field name="user_identifier">
          {(field) => (
            <StyledInput
              label="Phone or email"
              field={field}
              icon={Mail}
              placeholder="+977 98XXXXXXXX or you@example.com"
            />
          )}
        </form.Field>

        <form.Field name="gender">
          {(field) => {
            const hasError =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <div className="flex flex-col gap-1.5">
                <label
                  className={cn(
                    "text-[11px] font-semibold uppercase tracking-wider",
                    hasError ? "text-red-500" : "text-foreground/60",
                  )}
                >
                  Gender
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["male", "female", "other"] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => {
                        field.handleChange(g);
                        field.handleBlur();
                      }}
                      className={cn(
                        "rounded-xl border py-2 text-xs font-semibold capitalize transition-all duration-200",
                        field.state.value === g
                          ? "border-primary bg-primary/5 text-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]"
                          : "border-border bg-muted/30 text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {g === "male"
                        ? "👨 Male"
                        : g === "female"
                          ? "👩 Female"
                          : "🧑 Other"}
                    </button>
                  ))}
                </div>
                <FieldError field={field} />
              </div>
            );
          }}
        </form.Field>

        {serverError && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-900 dark:bg-red-950/30">
            {serverError}
          </p>
        )}

        <Button
          type="submit"
          variant="secondary"
          disabled={!canSubmit || isSubmitting || isPending}
          className="w-full gap-2 rounded-xl py-5 font-bold"
        >
          {isSubmitting || isPending ? (
            "Sending OTP…"
          ) : (
            <>
              Continue <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

// ─── STEP 1 — OTP VERIFY ─────────────────────────────────────────────────────

export function OtpStep({
  verificationIdx,
  userIdentifier,
  onNext,
  onBack,
  currentStep,
}: {
  verificationIdx: string;
  userIdentifier: string;
  onNext: (otpCode: string) => void;
  onBack: () => void;
  currentStep: 0 | 1 | 2;
}) {
  const [serverError, setServerError] = useState("");

  const form = useForm({
    defaultValues: { code: "" },
    validators: { onChange: otpSchema as any },
    onSubmit: (values) => {
      mutate(values.value);
    },
  });
  const { mutate, isPending } = useApiMutation({
    apiPath: `/api/autho/verification_code/${verificationIdx}/check_otp/`,
    method: "POST",
    onSuccessCallback: (data) => {
      onNext(data.code);
    },
    onErrorCallback(err) {
      setServerError(err.message);
    },
    payloadTransform: (payload: any) => ({
      code: payload.code,
    }),
  });

  const { canSubmit, isSubmitting } = useStore(form.store, (s) => ({
    canSubmit: s.canSubmit,
    isSubmitting: s.isSubmitting,
  }));

  return (
    <div className="flex flex-col">
      <AuthHeader icon={ShieldCheck} title="Verify your code">
        <p className="mt-1 text-xs text-muted-foreground">
          We sent an OTP to{" "}
          <span className="font-semibold text-foreground">
            {userIdentifier}
          </span>
        </p>
      </AuthHeader>
      <SignupStepBar current={currentStep} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col gap-3.5 mt-2"
      >
        <form.Field name="code">
          {(field) => (
            <StyledInput
              label="Verification code"
              field={field}
              icon={KeyRound}
              placeholder="Enter OTP"
              type="text"
            />
          )}
        </form.Field>

        {serverError && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-900 dark:bg-red-950/30">
            {serverError}
          </p>
        )}

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
            disabled={!canSubmit || isSubmitting || isPending}
            className="flex-1 gap-2 rounded-xl font-bold"
          >
            {isSubmitting || isPending ? (
              "Checking…"
            ) : (
              <>
                Verify <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>

      <p className="text-center text-[11px] text-muted-foreground">
        Didn't receive it?{" "}
        <button className="font-semibold text-primary hover:underline">
          Resend OTP
        </button>
      </p>
    </div>
  );
}

// ─── STEP 2 — SET PASSWORD ────────────────────────────────────────────────────

export function SetPasswordStep({
  verificationIdx,
  userIdentifier,
  otpCode,
  onDone,
  currentStep,
}: {
  verificationIdx: string;
  userIdentifier: string;
  otpCode: string;
  onDone: () => void;
  currentStep: 0 | 1 | 2;
}) {
  const [serverError, setServerError] = useState("");
  const [done, setDone] = useState(false);

  const form = useForm({
    defaultValues: { new_password: "" },
    validators: { onChange: passwordSchema as any },
    onSubmit: (values) => {
      mutate(values.value);
    },
  });

  const { mutate, isPending } = useApiMutation({
    apiPath: `/api/autho/verification_code/${verificationIdx}/verify_otp/`,
    method: "POST",
    payloadTransform: (payload: any) => ({
      new_password: payload.new_password,
      otp_code: otpCode,
      user_identifier: userIdentifier,
      for_account_verification: true,
    }),
    onSuccessCallback: (data) => {
      setDone(true);
      setTimeout(onDone, 1600);
    },
    onErrorCallback(err) {
      setServerError(err.message);
    },
  });

  const password = useStore(form.store, (s) => s.values.new_password);
  const { canSubmit, isSubmitting } = useStore(form.store, (s) => ({
    canSubmit: s.canSubmit,
    isSubmitting: s.isSubmitting,
  }));

  const strength = [password.length >= 8].filter(Boolean).length;

  const strengthLabel = ["Too weak", "Weak", "Fair", "Good", "Strong 💪"][
    strength
  ];

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
          <p className="mt-1 text-sm text-muted-foreground">
            Account created. Welcome aboard!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <AuthHeader icon={Lock} title="Set your password">
        <p className="mt-1 text-xs text-muted-foreground">
          Choose a strong password to protect your account
        </p>
      </AuthHeader>
      <SignupStepBar current={currentStep} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col gap-3.5 mt-2"
      >
        <form.Field name="new_password">
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
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-900 dark:bg-red-950/30">
            {serverError}
          </p>
        )}

        <Button
          type="submit"
          disabled={!canSubmit || isSubmitting || isPending}
          className="w-full gap-2 rounded-xl py-5 font-bold"
        >
          {isSubmitting || isPending ? (
            "Creating account…"
          ) : (
            <>
              Create account <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
