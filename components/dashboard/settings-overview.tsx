"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useStore } from "@tanstack/react-store";
import { z } from "zod";
import {
  Bell,
  ChevronRight,
  Globe,
  KeyRound,
  Loader2,
  Lock,
  LogOut,
  Save,
  Shield,
  Trash2,
  TriangleAlert,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn, useApiMutation } from "@/lib/utils";
import StyledInput from "@/components/form/FormInput";

// ─── SCHEMAS ─────────────────────────────────────────────────────────────────

const passwordSchema = z
  .object({
    old_password: z.string().min(1, "Current password is required"),
    new_password: z
      .string()
      .min(8, "Minimum 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type PasswordValues = z.infer<typeof passwordSchema>;

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
  accent = "primary",
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
  accent?: "primary" | "secondary" | "accent" | "destructive";
}) {
  const accentMap = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    accent: "bg-accent/10 text-accent",
    destructive: "bg-red-50 text-red-600 dark:bg-red-950/30",
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Card header */}
      <div className="flex items-center gap-4 border-b border-border px-6 py-5">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            accentMap[accent],
          )}
        >
          <Icon className="h-4.5 w-4.5 h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {/* Card body */}
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function SettingRow({
  label,
  description,
  children,
  last = false,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 py-3.5",
        !last && "border-b border-border/60",
      )}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function ChangePassword() {
  const [saved, setSaved] = useState(false);

  const { mutateAsync: changePassword } = useApiMutation<PasswordValues>({
    apiPath: "/api/autho/user-management/change-password/",
    method: "POST",
  });

  const form = useForm({
    defaultValues: { old_password: "", new_password: "", confirm_password: "" },
    validators: { onChange: passwordSchema as any },
    onSubmit: async ({ value }) => {
      await changePassword(value);
      setSaved(true);
      form.reset();
      setTimeout(() => setSaved(false), 2500);
    },
  });

  const newPw = useStore(form.store, (s) => s.values.new_password);
  const { canSubmit, isSubmitting } = useStore(form.store, (s) => ({
    canSubmit: s.canSubmit,
    isSubmitting: s.isSubmitting,
  }));

  const strength = [
    newPw.length >= 8,
    /[A-Z]/.test(newPw),
    /[0-9]/.test(newPw),
    /[^A-Za-z0-9]/.test(newPw),
  ].filter(Boolean).length;

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong 💪"][strength];
  const strengthColor = [
    "",
    "bg-red-400",
    "bg-amber-400",
    "bg-secondary",
    "bg-green-500",
  ][strength];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="flex flex-col gap-4"
    >
      <form.Field name="old_password">
        {(f) => (
          <StyledInput
            field={f}
            label="Current password"
            type="password"
            placeholder="Enter current password"
            icon={Lock}
          />
        )}
      </form.Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <form.Field name="new_password">
            {(f) => (
              <StyledInput
                field={f}
                label="New password"
                type="password"
                placeholder="Min. 8 characters"
                icon={KeyRound}
              />
            )}
          </form.Field>
          {newPw.length > 0 && (
            <div className="flex flex-col gap-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((l) => (
                  <div
                    key={l}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-all duration-300",
                      strength >= l ? strengthColor : "bg-muted",
                    )}
                  />
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {strengthLabel}
              </p>
            </div>
          )}
        </div>

        <form.Field name="confirm_password">
          {(f) => (
            <StyledInput
              field={f}
              label="Confirm password"
              type="password"
              placeholder="Repeat new password"
              icon={KeyRound}
            />
          )}
        </form.Field>
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className={cn(
            "gap-2 rounded-xl font-bold transition-all duration-300",
            saved && "bg-secondary hover:bg-secondary/90",
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving…
            </>
          ) : saved ? (
            <>
              <CheckCircle2 className="h-4 w-4" /> Updated!
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> Update password
            </>
          )}
        </Button>
        {saved && (
          <span className="text-xs text-secondary animate-in fade-in slide-in-from-left-2">
            Password changed successfully.
          </span>
        )}
      </div>
    </form>
  );
}

// ─── NOTIFICATION SETTINGS ───────────────────────────────────────────────────

type NotifKey =
  | "email_events"
  | "email_reminders"
  | "email_marketing"
  | "push_events"
  | "push_reminders";

const NOTIF_ROWS: { key: NotifKey; label: string; description: string }[] = [
  {
    key: "email_events",
    label: "New event alerts",
    description: "When events matching your interests are posted",
  },
  {
    key: "email_reminders",
    label: "Event reminders",
    description: "24h and 1h before events you've joined",
  },
  {
    key: "email_marketing",
    label: "Tips & announcements",
    description: "Product updates and community highlights",
  },
  {
    key: "push_events",
    label: "Push: new events",
    description: "Real-time alerts for nearby or followed events",
  },
  {
    key: "push_reminders",
    label: "Push: reminders",
    description: "Mobile push reminders before your events",
  },
];

function NotificationSettings() {
  const [prefs, setPrefs] = useState<Record<NotifKey, boolean>>({
    email_events: true,
    email_reminders: true,
    email_marketing: false,
    push_events: true,
    push_reminders: true,
  });
  const [saving, setSaving] = useState<NotifKey | null>(null);

  const toggle = async (key: NotifKey) => {
    const next = !prefs[key];
    setPrefs((p) => ({ ...p, [key]: next }));
    setSaving(key);
    try {
      await fetch("/api/autho/user-management/notifications/", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: next }),
      });
    } finally {
      setSaving(null);
    }
  };

  const emailRows = NOTIF_ROWS.filter((r) => r.key.startsWith("email_"));
  const pushRows = NOTIF_ROWS.filter((r) => r.key.startsWith("push_"));

  return (
    <div className="flex flex-col gap-0">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Email
      </p>
      {emailRows.map((row, i) => (
        <SettingRow
          key={row.key}
          label={row.label}
          description={row.description}
          last={i === emailRows.length - 1}
        >
          <Switch
            checked={prefs[row.key]}
            onCheckedChange={() => toggle(row.key)}
            disabled={saving === row.key}
          />
        </SettingRow>
      ))}

      <p className="mb-3 mt-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Push
      </p>
      {pushRows.map((row, i) => (
        <SettingRow
          key={row.key}
          label={row.label}
          description={row.description}
          last={i === pushRows.length - 1}
        >
          <Switch
            checked={prefs[row.key]}
            onCheckedChange={() => toggle(row.key)}
            disabled={saving === row.key}
          />
        </SettingRow>
      ))}
    </div>
  );
}

// ─── LANGUAGE / LOCALE ───────────────────────────────────────────────────────

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ne", label: "नेपाली", flag: "🇳🇵" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
];

function LanguageSettings() {
  const [selected, setSelected] = useState("en");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/autho/user-management/preferences/", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: selected }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => setSelected(lang.code)}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-xl border py-4 text-xs font-semibold transition-all duration-200",
              selected === lang.code
                ? "border-primary bg-primary/5 text-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]"
                : "border-border bg-muted/30 text-muted-foreground hover:bg-muted",
            )}
          >
            <span className="text-2xl">{lang.flag}</span>
            {lang.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className={cn(
            "gap-2 rounded-xl font-bold transition-all duration-300",
            saved && "bg-secondary hover:bg-secondary/90",
          )}
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving…
            </>
          ) : saved ? (
            <>
              <CheckCircle2 className="h-4 w-4" /> Saved!
            </>
          ) : (
            <>
              <Globe className="h-4 w-4" /> Save language
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── DANGER ZONE ─────────────────────────────────────────────────────────────

function DangerZone() {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const CONFIRM_PHRASE = "delete my account";
  const canDelete = confirmText.toLowerCase() === CONFIRM_PHRASE;

  const handleDelete = async () => {
    if (!canDelete) return;
    setDeleting(true);
    try {
      await fetch("/api/autho/user-management/me/", { method: "DELETE" });
      // redirect to home after deletion
      window.location.href = "/";
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-0">
        <SettingRow
          label="Sign out of all devices"
          description="Revoke all active sessions across your devices"
          last={false}
        >
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-lg text-xs"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out all
          </Button>
        </SettingRow>

        <SettingRow
          label="Delete account"
          description="Permanently delete your account and all data"
          last
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            className="gap-1.5 rounded-lg border-red-200 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:hover:bg-red-950/30"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete account
          </Button>
        </SettingRow>
      </div>

      {/* Confirm delete dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="overflow-hidden rounded-3xl border border-border bg-card p-0 shadow-2xl sm:max-w-md">
          <DialogTitle className="sr-only">Delete account</DialogTitle>

          <div className="h-[2.5px] w-full bg-gradient-to-r from-red-500 via-red-400 to-red-600" />

          <div className="flex flex-col gap-5 px-6 pb-6 pt-5">
            {/* Icon */}
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/30">
                <TriangleAlert className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="font-heading text-base font-bold text-foreground">
                  Delete your account
                </p>
                <p className="text-xs text-muted-foreground">
                  This action is permanent and cannot be undone.
                </p>
              </div>
            </div>

            {/* Warning list */}
            <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 text-xs dark:border-red-900 dark:bg-red-950/20">
              <p className="mb-2 font-semibold text-red-700 dark:text-red-400">
                What will be deleted:
              </p>
              {[
                "Your profile and all personal data",
                "All events you've created",
                "All event registrations and history",
                "Your organizer profile (if applicable)",
              ].map((item) => (
                <p
                  key={item}
                  className="mt-1 flex items-start gap-1.5 text-red-600/80 dark:text-red-400/80"
                >
                  <span className="mt-0.5 shrink-0">•</span> {item}
                </p>
              ))}
            </div>

            {/* Confirm input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">
                Type{" "}
                <span className="font-mono font-semibold text-foreground">
                  {CONFIRM_PHRASE}
                </span>{" "}
                to confirm
              </label>
              <input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={CONFIRM_PHRASE}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none ring-0 transition focus:border-red-400 focus:ring-2 focus:ring-red-400/20"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => setDeleteOpen(false)}
              >
                Cancel
              </Button>
              <Button
                disabled={!canDelete || deleting}
                onClick={handleDelete}
                className="flex-1 gap-2 rounded-xl bg-red-600 font-bold text-white hover:bg-red-700 disabled:opacity-40"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Deleting…
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" /> Delete forever
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

export function SettingsOverview() {
  return (
    <div className="flex flex-col gap-8 p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account preferences and security.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {/* Password */}
        <SectionCard
          icon={Shield}
          title="Change password"
          description="Update your password to keep your account secure"
          accent="primary"
        >
          <ChangePassword />
        </SectionCard>

        {/* Notifications */}
        <SectionCard
          icon={Bell}
          title="Notifications"
          description="Choose what you'd like to be notified about"
          accent="secondary"
        >
          <NotificationSettings />
        </SectionCard>

        {/* Language */}
        <SectionCard
          icon={Globe}
          title="Language"
          description="Choose your preferred display language"
          accent="accent"
        >
          <LanguageSettings />
        </SectionCard>

        {/* Danger zone */}
        <SectionCard
          icon={TriangleAlert}
          title="Danger zone"
          description="Irreversible actions — proceed with caution"
          accent="destructive"
        >
          <DangerZone />
        </SectionCard>
      </div>
    </div>
  );
}
