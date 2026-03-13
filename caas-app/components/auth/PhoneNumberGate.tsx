"use client";

import { useState, useRef, useEffect } from "react";
import { Phone, ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn, useApiMutation } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const OTP_LEN = 6;
type Step = "phone" | "otp";

function OtpInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const digits = value.padEnd(OTP_LEN, " ").split("");

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="tel"
        inputMode="numeric"
        value={value}
        maxLength={OTP_LEN}
        disabled={disabled}
        onChange={(e) =>
          onChange(e.target.value.replace(/\D/g, "").slice(0, OTP_LEN))
        }
        className="absolute inset-0 opacity-0 cursor-text z-10 w-full"
        aria-label="OTP code"
      />
      <div
        className="flex gap-2 justify-center"
        onClick={() => inputRef.current?.focus()}
      >
        {digits.map((d, i) => (
          <div
            key={i}
            className={cn(
              "h-12 w-10 rounded-xl border-2 flex items-center justify-center text-lg font-bold transition-all",
              i === value.length
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
  );
}

export function PhoneNumberGate({ userName }: { userName?: string }) {
  const router = useRouter();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationIdx, setVerificationIdx] = useState("");
  const [resendSecs, setResendSecs] = useState(0);

  useEffect(() => {
    if (resendSecs <= 0) return;
    const t = setTimeout(() => setResendSecs((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendSecs]);

  const {
    mutateAsync: sendOtp,
    isPending: isSending,
    error: sendError,
  } = useApiMutation({
    apiPath: "/api/autho/verification_code/send_otp_uid/",
    method: "POST",
    successMessage: "OTP sent successfully!",
    queryKey: "phone-send-otp",
    onSuccessCallback(data: any) {
      setVerificationIdx(data.verification.idx);
      setStep("otp");
      setResendSecs(60);
    },
  });

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !/^\d{10}$/.test(phone)) return;
    sendOtp({ user_identifier: phone });
  };

  const {
    mutateAsync: verifyOtp,
    isPending: isVerifying,
    error: verifyError,
  } = useApiMutation({
    apiPath: `/api/autho/verification_code/${verificationIdx}/verify_otp/`,
    method: "POST",
    queryKey: "phone-verify-otp",
    onSuccessCallback() {
      router.refresh();
    },
    successMessage: "OTP verified successfully!",
  });

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < OTP_LEN) return;
    verifyOtp({
      user_identifier: phone,
      otp_code: otp,
      for_account_verification: "false",
    });
  };

  const phoneError = sendError
    ? ((sendError as any)?.user_identifier?.[0] ??
      (sendError as any)?.detail ??
      "Failed to send OTP. Try again.")
    : null;

  const otpError = verifyError
    ? ((verifyError as any)?.otp_code?.[0] ??
      (verifyError as any)?.detail ??
      "Invalid code. Please try again.")
    : null;

  const isPending = isSending || isVerifying;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div className="w-full max-w-[360px] overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-card">
        <div className="h-[3.5px] w-full bg-gradient-to-r from-orange-500 via-yellow-400 to-green-400" />

        <div className="px-7 pb-7 pt-6 flex flex-col gap-5">
          {step === "phone" && (
            <>
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-2xl shadow-sm border border-orange-100">
                  📱
                </div>
                <h2 className="text-xl font-bold text-foreground tracking-tight">
                  Add your phone{userName ? `, ${userName}` : ""}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  We'll send a code to verify it
                </p>
              </div>

              <form onSubmit={handleSendOtp} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
                    <span className="absolute left-10 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground select-none pointer-events-none">
                      +977
                    </span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="98XXXXXXXX"
                      value={phone}
                      autoFocus
                      disabled={isPending}
                      onChange={(e) =>
                        setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                      }
                      className={cn(
                        "w-full rounded-xl border bg-gray-50 py-2.5 pl-[4.5rem] pr-4 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-all",
                        "focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-400/20",
                        phoneError ? "border-red-400" : "border-gray-200",
                      )}
                    />
                  </div>
                  {phoneError && (
                    <p className="text-[11px] text-red-500">{phoneError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isPending || phone.length < 10}
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />{" "}
                      Sending code…
                    </>
                  ) : (
                    <>
                      Send verification code <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-[11px] text-muted-foreground/50">
                Your number is private and only used for account notifications.
              </p>
            </>
          )}

          {step === "otp" && (
            <>
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-2xl shadow-sm border border-orange-100">
                  🔐
                </div>
                <h2 className="text-xl font-bold text-foreground tracking-tight">
                  Enter the code
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sent to{" "}
                  <span className="font-semibold text-foreground">
                    +977 {phone}
                  </span>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-3">
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground text-center">
                    Verification Code
                  </label>
                  <OtpInput
                    value={otp}
                    onChange={setOtp}
                    disabled={isPending}
                  />
                  {otpError && (
                    <p className="text-[11px] text-red-500 text-center">
                      {otpError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isPending || otp.length < OTP_LEN}
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerifying ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />{" "}
                      Verifying…
                    </>
                  ) : (
                    <>
                      Verify &amp; continue <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    setStep("phone");
                    setOtp("");
                  }}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  <ArrowLeft className="h-3 w-3" /> Change number
                </button>
                {resendSecs > 0 ? (
                  <span className="text-xs text-muted-foreground">
                    Resend in {resendSecs}s
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => {
                      setOtp("");
                      setStep("phone");
                    }}
                    className="text-xs font-bold text-primary hover:underline disabled:opacity-50"
                  >
                    Resend code
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
