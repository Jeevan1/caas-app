import { cn } from "@/lib/utils";
import { AnyFieldApi } from "@tanstack/react-form";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import FieldError from "./FIeldError";

// ── Combined label + input + error ────────────────────────────────────────────
function FieldInput({
  field,
  label,
  icon: Icon,
  type = "text",
  placeholder,
  required = false,
}: {
  field: AnyFieldApi;
  label: string;
  icon?: any;
  type?: string;
  placeholder: string;
  required?: boolean;
}) {
  const [show, setShow] = useState(false);
  const isPass = type === "password";
  const hasError = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <div className="flex flex-col gap-1.5">
      {/* Label */}
      <label className="text-[11px] font-semibold uppercase tracking-wider text-foreground/60 flex items-center">
        {label}{" "}
        <span>{required && <span className="text-red-400">*</span>}</span>
      </label>

      {/* Input row */}
      <div
        className={cn(
          "relative flex items-center gap-2.5",
          "rounded-xl border bg-muted/30 px-3.5 py-2.5",
          "transition-all duration-200",
          hasError
            ? [
                "border-red-400/70",
                "focus-within:border-red-400",
                "focus-within:shadow-[0_0_0_3px_hsl(0_84%_60%/0.12)]",
              ]
            : [
                "border-border",
                "focus-within:border-primary/50",
                "focus-within:bg-background",
                "focus-within:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]",
              ],
        )}
      >
        {Icon && (
          <Icon
            className={cn(
              "h-3.5 w-3.5 shrink-0",
              hasError ? "text-red-400" : "text-muted-foreground/70",
            )}
          />
        )}

        <input
          name={field.name}
          type={isPass ? (show ? "text" : "password") : type}
          placeholder={placeholder}
          value={String(field.state.value ?? "")}
          onChange={(e) => field.handleChange(e.target.value as any)}
          onBlur={field.handleBlur}
          className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/40"
        />

        {isPass && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="text-muted-foreground/50 transition-colors hover:text-muted-foreground"
          >
            {show ? (
              <EyeOff className="h-3.5 w-3.5" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </div>

      {/* Inline error */}
      <FieldError field={field} />
    </div>
  );
}

export default FieldInput;
