"use client";

import { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useStore } from "@tanstack/react-store";
import { z } from "zod";
import {
  Camera,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  Save,
  User,
  Calendar,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn, useApiMutation } from "@/lib/utils";
import StyledInput from "@/components/form/FormInput";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { useCurrentUser } from "@/lib/providers";

// ─── TYPES ───────────────────────────────────────────────────────────────────

type DobType = "ad" | "bs";
type Gender = "male" | "female" | "other";

type UserProfile = {
  idx: string;
  name: string;
  email: string;
  phone: string | null;
  gender: Gender;
  dob_type: DobType;
  image: string | null;
  primary_role: string;
};

// ─── QUERY KEY ───────────────────────────────────────────────────────────────

export const PROFILE_QUERY_KEY = ["profile", "me"];

// ─── SCHEMA ──────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").min(2, "At least 2 characters"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  phone: z.string().optional(),
  gender: z.enum(["male", "female", "other"]),
  dob_type: z.enum(["ad", "bs"]),
  image: z
    .instanceof(File)
    .refine((f) => f.size <= 5 * 1024 * 1024, "Max 5 MB")
    .optional(),
});

type ProfileValues = z.infer<typeof profileSchema>;

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  organizer: { label: "Organizer", color: "text-primary", bg: "bg-primary/10" },
  attendee: {
    label: "Attendee",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  admin: { label: "Admin", color: "text-accent", bg: "bg-accent/10" },
};

const GENDER_OPTIONS: { value: Gender; emoji: string; label: string }[] = [
  { value: "male", emoji: "👨", label: "Male" },
  { value: "female", emoji: "👩", label: "Female" },
  { value: "other", emoji: "🧑", label: "Other" },
];

const DOB_OPTIONS: { value: DobType; label: string; sub: string }[] = [
  { value: "ad", label: "AD", sub: "Gregorian" },
  { value: "bs", label: "BS", sub: "Bikram Sambat" },
];

function Section({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <div className="h-px flex-1 bg-border/60" />
    </div>
  );
}

// ─── AVATAR UPLOADER ─────────────────────────────────────────────────────────

function AvatarUpload({
  currentImage,
  name,
  onChange,
}: {
  currentImage: string | null;
  name: string;
  onChange: (file: File) => void;
}) {
  const [preview, setPreview] = useState<string | null>(currentImage);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onChange(file);
  };

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <label className="group relative mx-auto flex h-24 w-24 cursor-pointer items-center justify-center">
      {/* Avatar */}
      <div className="h-24 w-24 overflow-hidden rounded-2xl border-2 border-border bg-muted shadow-md transition-opacity group-hover:opacity-80">
        {preview ? (
          <Image
            src={preview}
            alt={name}
            width={96}
            height={96}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary/10 font-heading text-2xl font-bold text-primary">
            {initials || <User className="h-8 w-8" />}
          </div>
        )}
      </div>

      {/* Camera overlay */}
      <div className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-xl border-2 border-card bg-foreground shadow-md transition-transform group-hover:scale-110">
        <Camera className="h-3.5 w-3.5 text-background" />
      </div>

      <input
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleFile}
      />
    </label>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

export function ProfileOverview() {
  const [saved, setSaved] = useState(false);

  const profile = useCurrentUser();

  const { mutateAsync: updateProfile, isPending: isSubmitting } =
    useApiMutation<ProfileValues>({
      apiPath: "/api/autho/user_info/me/",
      method: "PATCH",
      queryKey: PROFILE_QUERY_KEY,
    });

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      gender: "male" as Gender,
      dob_type: "ad" as DobType,
      image: undefined as File | undefined,
    } satisfies ProfileValues,
    validators: { onChange: profileSchema as any },
    onSubmit: async ({ value }) => {
      await updateProfile(value);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  // Populate form once profile loads
  useEffect(() => {
    if (!profile) return;
    form.setFieldValue("name", profile.name ?? "");
    form.setFieldValue("email", profile.email ?? "");
    form.setFieldValue("phone", profile.phone ?? "");
    form.setFieldValue("gender", profile.gender ?? "male");
    form.setFieldValue("dob_type", profile.dob_type ?? "ad");
  }, [profile]);

  const gender = useStore(form.store, (s) => s.values.gender);
  const dob_type = useStore(form.store, (s) => s.values.dob_type);
  const { canSubmit } = useStore(form.store, (s) => ({
    canSubmit: s.canSubmit,
  }));

  const roleConfig = ROLE_LABELS[profile?.primary_role ?? ""] ?? {
    label: profile?.primary_role,
    color: "text-muted-foreground",
    bg: "bg-muted",
  };

  // ── Skeleton ─────────────────────────────────────────────────────────────
  //   if (isLoading) {
  //     return (
  //       <div className="flex flex-col gap-8 p-6 lg:p-8">
  //         <div className="h-8 w-40 animate-pulse rounded-lg bg-muted/70" />
  //         <div className="rounded-2xl border border-border bg-card p-8">
  //           <div className="flex flex-col items-center gap-4">
  //             <div className="h-24 w-24 animate-pulse rounded-2xl bg-muted/70" />
  //             <div className="h-5 w-36 animate-pulse rounded-md bg-muted/70" />
  //             <div className="h-4 w-24 animate-pulse rounded-md bg-muted/50" />
  //           </div>
  //         </div>
  //       </div>
  //     );
  //   }

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
          Profile
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your personal information.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* ── Left card: identity ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6">
          {/* Avatar */}
          <form.Field name="image">
            {(f) => (
              <AvatarUpload
                currentImage={profile?.image ?? null}
                name={form.getFieldValue("name") || profile?.name || ""}
                onChange={(file) => f.handleChange(file)}
              />
            )}
          </form.Field>

          {/* Name + email */}
          <div className="text-center">
            <p className="font-heading text-lg font-bold text-foreground">
              {profile?.name}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {profile?.email}
            </p>
          </div>

          {/* Role badge — read only */}
          <div className="flex flex-col items-center gap-1.5">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
                roleConfig.bg,
                roleConfig.color,
              )}
            >
              {roleConfig.label}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Lock className="h-2.5 w-2.5" /> Role cannot be changed
            </span>
          </div>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Quick info pills */}
          <div className="flex flex-col gap-2 text-xs">
            {[
              { icon: Mail, label: profile?.email ?? "—" },
              { icon: Phone, label: profile?.phone ?? "No phone added" },
              {
                icon: User,
                label: profile?.gender
                  ? profile.gender.charAt(0).toUpperCase() +
                    profile.gender.slice(1)
                  : "—",
              },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 text-muted-foreground"
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right card: edit form ─────────────────────────────────────── */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="flex flex-col gap-5"
          >
            <Section label="Personal info" />

            <div className="grid gap-4 sm:grid-cols-2">
              <form.Field name="name">
                {(f) => (
                  <StyledInput
                    field={f}
                    label="Full name"
                    placeholder="Your name"
                    icon={User}
                  />
                )}
              </form.Field>
              <form.Field name="email">
                {(f) => (
                  <StyledInput
                    field={f}
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    icon={Mail}
                  />
                )}
              </form.Field>
            </div>

            <form.Field name="phone">
              {(f) => (
                <StyledInput
                  field={f}
                  label="Phone"
                  type="tel"
                  placeholder="+977 98XXXXXXXX"
                  icon={Phone}
                  required={false}
                />
              )}
            </form.Field>

            {/* Gender selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-foreground/60">
                Gender
              </label>
              <div className="grid grid-cols-3 gap-2">
                {GENDER_OPTIONS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => form.setFieldValue("gender", g.value)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl border py-3 text-xs font-semibold transition-all duration-200",
                      gender === g.value
                        ? "border-primary bg-primary/5 text-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]"
                        : "border-border bg-muted/30 text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <span className="text-base">{g.emoji}</span>
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <Section label="Date format" />

            {/* DOB type selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-foreground/60">
                Calendar system
              </label>
              <div className="grid grid-cols-2 gap-2">
                {DOB_OPTIONS.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => form.setFieldValue("dob_type", d.value)}
                    className={cn(
                      "flex flex-col items-start gap-0.5 rounded-xl border px-4 py-3 text-left transition-all duration-200",
                      dob_type === d.value
                        ? "border-secondary bg-secondary/5 shadow-[0_0_0_3px_hsl(var(--secondary)/0.12)]"
                        : "border-border bg-muted/30 hover:bg-muted",
                    )}
                  >
                    <span
                      className={cn(
                        "flex items-center gap-1.5 text-sm font-bold",
                        dob_type === d.value
                          ? "text-secondary"
                          : "text-foreground",
                      )}
                    >
                      <Calendar className="h-3.5 w-3.5" /> {d.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {d.sub}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Save button */}
            <div className="flex items-center gap-3 pt-1">
              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className={cn(
                  "gap-2 rounded-xl font-bold transition-all duration-300",
                  saved && "bg-secondary hover:bg-secondary/90",
                )}
              >
                {isSubmitting ? (
                  "Saving…"
                ) : saved ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Saved!
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Save changes
                  </>
                )}
              </Button>

              {saved && (
                <span className="text-xs text-secondary animate-in fade-in slide-in-from-left-2 duration-300">
                  Profile updated successfully.
                </span>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
