import { cn } from "@/lib/utils";
import FieldError from "./FIeldError";
import { AnyFieldApi } from "@tanstack/react-form";

function FieldTextarea({
  field,
  label,
  placeholder,
  maxLength = 100,
  optional = false,
}: {
  field: AnyFieldApi;
  label: string;
  placeholder: string;
  maxLength?: number;
  optional?: boolean;
}) {
  const value = String(field.state.value ?? "");
  const hasError = field.state.meta.isTouched && !field.state.meta.isValid;
  const nearMax = value.length > maxLength * 0.9;

  return (
    <div className="flex flex-col gap-1.5">
      {/* Label row */}
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-foreground/60">
          {label}{" "}
          {optional && (
            <span className="font-normal normal-case text-muted-foreground">
              (optional)
            </span>
          )}
        </label>
        <span
          className={cn(
            "text-[10px]",
            nearMax ? "font-semibold text-accent" : "text-muted-foreground",
          )}
        >
          {value.length}/{maxLength}
        </span>
      </div>

      {/* Textarea */}
      <div
        className={cn(
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
        <textarea
          placeholder={placeholder}
          value={value}
          rows={2}
          onChange={(e) =>
            field.handleChange(e.target.value.slice(0, maxLength) as any)
          }
          onBlur={field.handleBlur}
          className="w-full resize-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/40"
        />
      </div>

      {/* Inline error */}
      <FieldError field={field} />
    </div>
  );
}

export default FieldTextarea;
