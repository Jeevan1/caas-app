// ─── STEP 0 — REGISTER ───────────────────────────────────────────────────────

import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { Button } from "../ui/button";
import StyledInput from "@/components/form/FormInput";
import { useForm, useStore } from "@tanstack/react-form";
import { useEffect, useRef, useState } from "react";
import { cn, useApiMutation } from "@/lib/utils";
import FieldError from "../form/FIeldError";
import z from "zod";
import AuthHeader from "./AuthHeader";
import { SignupStepBar } from "./AuthModel";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "@/i18n/navigation";

// ─── SCHEMAS ─────────────────────────────────────────────────────────────────

const registerSchema = z.object({
  name: z.string().min(1, "Name is required").min(2, "At least 2 characters"),
  user_identifier: z.string().min(1, "Phone or email is required"),
  gender: z.string().optional(),
});

const otpSchema = z.object({
  code: z.string().min(4, "Enter the OTP code").max(8, "OTP too long"),
});

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Minimum 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    new_password: z.string().min(1, "Please confirm your password"),
  })
  .superRefine(({ password, new_password }, ctx) => {
    if (password !== new_password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["new_password"],
      });
    }
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
    defaultValues: { name: "", user_identifier: "", gender: "" },
    validators: { onChange: registerSchema as any },
    onSubmit: ({ value }) => {
      mutate(value);
    },
  });

  const { mutate, isPending } = useApiMutation<{ user_identifier: string }>({
    apiPath: isOrganizer
      ? "/api/autho/user-management/register-organizer/"
      : "/api/autho/user-management/register/",
    method: "POST",
    successMessage: "Verification code sent successfully!",
    onSuccessCallback: (data, payload) => {
      if (payload) onNext(data.verification.idx, payload.user_identifier);
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
        title={isOrganizer ? "Register as Organizer" : "Create your account"}
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
              label={isOrganizer ? "Organizer name" : "Full name"}
              field={field}
              icon={isOrganizer ? Building2 : User}
              placeholder={isOrganizer ? "Organizer name" : "John Doe"}
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
              {" "}
              Continue <ArrowRight className="h-4 w-4" />{" "}
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
  const [otp, setOtp] = useState("");
  const otpRef = useRef<HTMLInputElement>(null);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    otpRef.current?.focus();
  }, []);

  const { mutate, isPending } = useApiMutation({
    apiPath: `/api/autho/verification_code/${verificationIdx}/check_otp/`,
    method: "POST",
    successMessage: "OTP verified successfully!",
    onSuccessCallback: (data) => {
      onNext(otp);
    },
    onErrorCallback(err) {
      setServerError(err.message);
    },
    payloadTransform: (payload: any) => ({ code: payload.code }),
  });

  const { mutate: mutateResend, isPending: isPendingResend } = useApiMutation({
    apiPath: `/api/autho/verification_code/send_otp_uid/`,
    method: "POST",
    payloadTransform: () => ({ user_identifier: userIdentifier }),
    successMessage: "OTP sent successfully!",
    onSuccessCallback: () => {
      setServerError("");
      setTimer(30);
    },
    onErrorCallback(err) {
      setTimer(30);
      setServerError(err.message);
    },
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
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-2xl shadow-sm border border-orange-100">
          🔐
        </div>
        <h2 className="text-xl font-bold text-foreground tracking-tight">
          Verify your code
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We sent an OTP to{" "}
          <span className="font-semibold text-foreground">
            {userIdentifier}
          </span>
        </p>
      </div>

      <SignupStepBar current={currentStep} />

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
                        ? "border-gray-300 bg-white"
                        : "border-gray-200 bg-gray-50",
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
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 py-3 text-sm font-semibold text-foreground hover:bg-gray-100 disabled:opacity-50 transition-colors"
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
          type="button" // Always specify type="button" to prevent form submission
          disabled={isPendingResend || timer > 0}
          className="font-semibold text-primary hover:underline disabled:text-muted-foreground disabled:no-underline disabled:cursor-not-allowed"
          onClick={mutateResend}
        >
          {isPendingResend
            ? "Resending..."
            : timer > 0
              ? `Resend in ${timer}s`
              : "Resend OTP"}
        </button>
      </p>
    </div>
  );
}

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
  const router = useRouter(); // ← initialised
  const [serverError, setServerError] = useState("");
  const [done, setDone] = useState(false);
  const passwordRef = useRef("");

  const form = useForm({
    defaultValues: { new_password: "", password: "" },
    validators: { onChange: passwordSchema as any },
    onSubmit: (values) => {
      passwordRef.current = values.value.password;
      mutate(values.value);
    },
  });

  const { mutate, isPending } = useApiMutation({
    apiPath: `/api/autho/verification_code/${verificationIdx}/verify_otp/`,
    method: "POST",
    showSuccessuseToast: false,
    payloadTransform: (payload: any) => ({
      new_password: payload.new_password,
      otp_code: otpCode,
      user_identifier: userIdentifier,
      for_account_verification: true,
    }),
    successMessage: "Welcome to Join Your Event! 🎉",
    onSuccessCallback: async (_data, payload) => {
      await login({
        user_identifier: userIdentifier,
        password: passwordRef.current,
      });
    },
    onErrorCallback(err) {
      setServerError(err.message);
    },
  });

  const { mutateAsync: login } = useApiMutation({
    apiPath: "/api/autho/create-token/",
    method: "POST",
    queryKey: "login",
    onSuccessCallback() {
      toast({
        title: "Welcome aboard! 🎉",
        description: "Your account has been created and you are now logged in.",
        duration: 5000,
      });
      setDone(true);
      router.refresh();
      setTimeout(onDone, 1600);
    },
    onErrorCallback(err) {
      setDone(true);
      setTimeout(onDone, 1600);
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
        <form.Field name="new_password">
          {(field) => (
            <StyledInput
              label="Confirm password"
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
              {" "}
              Create account <ArrowRight className="h-4 w-4" />{" "}
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
