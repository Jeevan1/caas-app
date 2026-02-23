import { toast as sonnerToast } from "sonner";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, TriangleAlert, Info, X } from "lucide-react";

type VariantType = "success" | "error" | "warning" | "info" | "custom";

interface ToastOptions {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: VariantType;
  showIcon?: boolean;
}

const VARIANTS = {
  success: {
    bar: "bg-emerald-500",
    iconBg: "bg-emerald-50 text-emerald-600",
    icon: CheckCircle2,
  },
  error: {
    bar: "bg-red-500",
    iconBg: "bg-red-50 text-red-600",
    icon: XCircle,
  },
  warning: {
    bar: "bg-amber-400",
    iconBg: "bg-amber-50 text-amber-600",
    icon: TriangleAlert,
  },
  info: {
    bar: "bg-blue-500",
    iconBg: "bg-blue-50 text-blue-600",
    icon: Info,
  },
  custom: {
    bar: "bg-border",
    iconBg: "bg-muted text-muted-foreground",
    icon: Info,
  },
} satisfies Record<VariantType, { bar: string; iconBg: string; icon: any }>;

function ToastContent({
  title,
  description,
  action,
  variant = "info",
  showIcon = true,
  toastId,
}: ToastOptions & { toastId: string | number }) {
  const config = VARIANTS[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex w-full min-w-[300px] max-w-sm overflow-hidden rounded-2xl",
        "border border-border bg-card shadow-[0_8px_30px_rgb(0,0,0,0.08)]",
        "ring-1 ring-inset ring-white/[0.06]",
      )}
    >
      <div className={cn("w-1 shrink-0", config.bar)} />

      <div className="flex flex-1 items-start gap-3 px-4 py-3.5">
        {showIcon && (
          <div
            className={cn(
              "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
              config.iconBg,
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </div>
        )}

        <div className="flex-1 space-y-0.5">
          {title && (
            <p className="text-sm font-semibold leading-snug text-foreground">
              {title}
            </p>
          )}
          {description && (
            <p className="text-xs leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
          {action && <div className="mt-2">{action}</div>}
        </div>

        <button
          type="button"
          onClick={() => sonnerToast.dismiss(toastId)}
          className={cn(
            "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg",
            "text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground",
          )}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export function showToast({
  title,
  description,
  action,
  variant = "info",
  showIcon = true,
}: ToastOptions) {
  if (!title && !description && !action) return;

  return sonnerToast.custom((id) => (
    <ToastContent
      toastId={id}
      title={title}
      description={description}
      action={action}
      variant={variant}
      showIcon={showIcon}
    />
  ));
}
