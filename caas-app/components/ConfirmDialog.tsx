import { useState } from "react";
import { Trash2, AlertTriangle, RefreshCw, X, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApiMutation } from "@/lib/utils";

type Variant = "delete" | "update" | "custom";

interface ConfirmDialogProps {
  // Behaviour
  variant?: Variant;
  // Content
  title?: string;
  description?: React.ReactNode;
  itemName?: string;
  // API
  url?: string;
  method?: "DELETE" | "POST" | "PUT" | "PATCH";
  payload?: Record<string, unknown>;
  queryKey?: (string | number)[] | string;
  // Trigger
  trigger?: (open: () => void) => React.ReactNode;
  // Callbacks
  onSuccess?: (data?: any) => void;
  onCancel?: () => void;
  // Labels
  confirmLabel?: string;
  cancelLabel?: string;
  // Appearance
  confirmClassName?: string;
  iconClassName?: string;
  iconBgClassName?: string;
  icon?: LucideIcon;
}

const VARIANT_DEFAULTS = {
  delete: {
    title: "Are you sure?",
    confirmLabel: "Delete",
    confirmClassName:
      "h-8 gap-1.5 rounded-lg bg-red-500 px-3 text-xs text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700",
    iconClassName: "text-red-500",
    iconBgClassName: "bg-red-50 dark:bg-red-950/40",
    borderClassName:
      "border-red-100 shadow-red-100/50 dark:border-red-900/30 dark:shadow-red-950/30",
    Icon: Trash2,
    method: "DELETE" as const,
  },
  update: {
    title: "Confirm update",
    confirmLabel: "Update",
    confirmClassName:
      "h-8 gap-1.5 rounded-lg bg-primary px-3 text-xs text-primary-foreground hover:bg-primary/90",
    iconClassName: "text-primary",
    iconBgClassName: "bg-primary/10",
    borderClassName: "border-border shadow-black/5",
    Icon: RefreshCw,
    method: "PATCH" as const,
  },
  custom: {
    title: "Confirm",
    confirmLabel: "Confirm",
    confirmClassName:
      "h-8 gap-1.5 rounded-lg bg-foreground px-3 text-xs text-background hover:bg-foreground/90",
    iconClassName: "text-foreground",
    iconBgClassName: "bg-muted",
    borderClassName: "border-border shadow-black/5",
    Icon: AlertTriangle,
    method: "POST" as const,
  },
} as const;

export function ConfirmDialog({
  variant = "delete",
  title,
  description,
  itemName,
  url,
  method,
  payload = {},
  queryKey,
  trigger,
  onSuccess,
  onCancel,
  confirmLabel,
  cancelLabel = "Cancel",
  confirmClassName,
  iconClassName,
  iconBgClassName,
  icon: CustomIcon,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);

  const defaults = VARIANT_DEFAULTS[variant];
  const finalMethod = method ?? defaults.method;
  const Icon = CustomIcon ?? defaults.Icon;

  const { mutateAsync, isPending } = useApiMutation({
    apiPath: url ?? "",
    method: finalMethod,
    queryKey: queryKey,
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    if (isPending) return;
    setOpen(false);
    onCancel?.();
  };

  const handleConfirm = async () => {
    try {
      const data = await mutateAsync(payload);
      setOpen(false);
      onSuccess?.(data);
    } catch {}
  };

  const resolvedTitle = title ?? defaults.title;
  const resolvedConfirmLabel = confirmLabel ?? defaults.confirmLabel;
  const resolvedConfirmClassName =
    confirmClassName ?? defaults.confirmClassName;
  const resolvedIconClassName = iconClassName ?? defaults.iconClassName;
  const resolvedIconBgClassName = iconBgClassName ?? defaults.iconBgClassName;

  const resolvedDescription =
    description ??
    (itemName ? (
      variant === "delete" ? (
        <>
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            "{itemName}"
          </span>{" "}
          will be permanently deleted. This action cannot be undone.
        </>
      ) : (
        <>
          You are about to update{" "}
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            "{itemName}"
          </span>
          . Please confirm you want to proceed.
        </>
      )
    ) : variant === "delete" ? (
      "This will be permanently deleted. This action cannot be undone."
    ) : (
      "Please confirm you want to proceed with this action."
    ));

  return (
    <>
      {/* ── Trigger ── */}
      {trigger ? (
        trigger(handleOpen)
      ) : variant === "delete" ? (
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={handleOpen}
          className="h-8 gap-1.5"
        >
          <Trash2 className="h-3 w-3" /> Delete
        </Button>
      ) : (
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={handleOpen}
          className="h-8 gap-1.5 rounded-lg px-3 text-xs"
        >
          <Icon className="h-3 w-3" /> {resolvedConfirmLabel}
        </Button>
      )}

      {/* ── Modal ── */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleClose}
          />

          <div className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
            <div
              className={`relative rounded-xl border bg-white shadow-2xl dark:bg-zinc-900 ${defaults.borderClassName}`}
            >
              <button
                onClick={handleClose}
                disabled={isPending}
                className="absolute right-3 top-3 rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors disabled:pointer-events-none disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="p-6">
                <div
                  className={`mb-4 flex h-11 w-11 items-center justify-center rounded-full ${resolvedIconBgClassName}`}
                >
                  <Icon className={`h-5 w-5 ${resolvedIconClassName}`} />
                </div>

                <h2 className="mb-1.5 text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {resolvedTitle}
                </h2>

                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {resolvedDescription}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-zinc-100 px-6 py-4 dark:border-zinc-800">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isPending}
                  className="h-8 rounded-lg px-3 text-xs"
                >
                  {cancelLabel}
                </Button>
                <Button
                  size="sm"
                  disabled={isPending}
                  onClick={handleConfirm}
                  className={resolvedConfirmClassName}
                >
                  {isPending ? (
                    <>
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      {resolvedConfirmLabel}…
                    </>
                  ) : (
                    <>
                      <Icon className="h-3 w-3" />
                      {resolvedConfirmLabel}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export function DeleteAlertDialog(
  props: Omit<ConfirmDialogProps, "variant" | "method">,
) {
  return <ConfirmDialog {...props} variant="delete" method="DELETE" />;
}

export function UpdateConfirmDialog(
  props: Omit<ConfirmDialogProps, "variant">,
) {
  return <ConfirmDialog {...props} variant="update" />;
}
