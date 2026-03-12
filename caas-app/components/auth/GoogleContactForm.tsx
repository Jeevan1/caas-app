import GoogleIcon from "@/public/icons/GoogleIcon";
import { useForm, useStore } from "@tanstack/react-form";
import { ArrowRight, CheckCircle2, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import FieldTextarea from "../form/FieldTextarea";
import { Button } from "../ui/button";
import StyledInput from "../form/FormInput";
import z from "zod";
import { useApiMutation } from "@/lib/utils";

const googleContactSchema = z.object({
  phone: z
    .string()
    .min(1, "Phone is required")
    .regex(/^\+?[0-9\s\-]{7,15}$/, "Enter a valid phone number"),
  city: z.string().min(1, "City is required").min(2, "At least 2 characters"),
  bio: z.string().max(100, "Max 100 characters").optional(),
});

type View = "login" | "signup" | "google-contact";

export function GoogleContactForm({
  switchView,
  onSuccess,
  onClose,
  email, // ← new
  name, // ← new
}: {
  switchView: (v: View) => void;
  onSuccess?: () => void;
  onClose?: () => void;
  email?: string;
  name?: string;
}) {
  const [done, setDone] = useState(false);

  const { mutateAsync: updateProfile, isPending } = useApiMutation({
    apiPath: "/api/autho/profile/",
    method: "PATCH",
    queryKey: "current-user",
    onSuccessCallback() {
      setDone(true);
      if (onSuccess) setTimeout(onSuccess, 1600);
      if (onClose) setTimeout(onClose, 1600);
    },
  });

  const form = useForm({
    defaultValues: { phone: "", city: "", bio: "" },
    validators: {
      onChange: googleContactSchema as any,
    },
    onSubmit: async ({ value }) => {
      await updateProfile({
        phone: value.phone,
        city: value.city,
        bio: value.bio,
      });
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
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome to Join Your Event
          </p>
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

      {/* Google account pill — now shows real email/name */}
      <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-3.5 py-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4285F4] text-[11px] font-bold text-white">
          {name?.charAt(0).toUpperCase() ?? "G"}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground">
            {name ?? "Signing in with Google"}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            {email ?? "yourname@gmail.com"}
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
            disabled={!canSubmit || isSubmitting || isPending}
            className="sub-btn flex flex-1"
          >
            {isSubmitting || isPending ? (
              "Saving…"
            ) : (
              <>
                Continue <ArrowRight className="h-4 w-4 sub-arrow" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
