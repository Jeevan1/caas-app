"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { AnyFieldApi } from "@tanstack/react-form";
import { AlertCircle, Loader2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { DebouncedInput } from "./DebounceInputField";

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface Option {
  value: string;
  label: string;
}

interface FieldSelectProps {
  // TanStack Form field — field.state.value is the selected value string
  field: AnyFieldApi;

  label: string;
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;
  className?: string;

  // Static options
  options?: Option[];

  // API-driven options
  url?: string;
  mapOptions?: (item: any) => Option;
  debounceTime?: number;
  queryParams?: Record<string, string>;

  // Extra options merged alongside static/API options (e.g. an "All" entry)
  extraOptions?: Option[];

  // Slot for an inline "Add" button next to the trigger
  addComponent?: React.ReactNode;

  // Disable the search box
  searchable?: boolean;
}

// ─── FIELD ERROR ─────────────────────────────────────────────────────────────

function FieldError({ field }: { field: AnyFieldApi }) {
  const error =
    field.state.meta.isTouched && !field.state.meta.isValid
      ? field.state.meta.errors[0]
      : undefined;
  if (!error) return null;
  return (
    <div className="flex items-center gap-1.5 text-[11px] font-medium text-red-500">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {String(error)}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export function FieldSelect({
  field,
  label,
  placeholder = "Select an option",
  required = false,
  optional = false,
  disabled = false,
  className,
  options = [],
  url,
  mapOptions,
  debounceTime = 500,
  queryParams,
  extraOptions = [],
  addComponent,
  searchable = true,
}: FieldSelectProps) {
  const [query, setQuery] = useState("");
  const cachedOptionRef = useRef<Option | null>(null);

  // ── Current value from field ──────────────────────────────────────────────
  const currentValue = useMemo(() => {
    const val = field.state.value;
    return val ? String(val) : "";
  }, [field.state.value]);

  // ── API options ───────────────────────────────────────────────────────────
  const { data: apiData, isFetching } = useApiQuery<any>({
    url: url ?? "",
    queryKey: [url, query, queryParams],
    enabled: !!url,
    queryParams: {
      ...(queryParams ?? {}),
      ...(query ? { search: query } : {}),
    },
    select: (res) => {
      const result = res?.results ?? res;
      if (!Array.isArray(result)) return [];
      return mapOptions ? result.map(mapOptions) : result;
    },
  });

  // ── Merge options, deduplicate by value ───────────────────────────────────
  const mergedOptions = useMemo(() => {
    const all = [...options, ...(apiData ?? []), ...extraOptions];
    const map = new Map<string, Option>();
    all.forEach((opt) => {
      if (opt?.value) map.set(String(opt.value), opt);
    });

    // Keep cached selected option even if it scrolls out of API results
    if (currentValue && !map.has(currentValue) && cachedOptionRef.current) {
      map.set(currentValue, cachedOptionRef.current);
    }
    return Array.from(map.values());
  }, [options, apiData, extraOptions, currentValue]);

  // ── Cache selected option label ───────────────────────────────────────────
  useEffect(() => {
    if (!currentValue) return;
    const found = mergedOptions.find((o) => String(o.value) === currentValue);
    if (found) cachedOptionRef.current = found;
  }, [currentValue, mergedOptions]);

  // ── Filtered options (client-side when no API) ────────────────────────────
  const filtered = useMemo(() => {
    if (!query || url) return mergedOptions; // API handles search when url present
    return mergedOptions.filter((o) =>
      o.label.toLowerCase().includes(query.toLowerCase()),
    );
  }, [mergedOptions, query, url]);

  // ── Change handler ────────────────────────────────────────────────────────
  const handleChange = (val: string) => {
    field.handleChange(val);
    field.handleBlur();
  };

  const hasError = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {/* Label */}
      <label
        className={cn(
          "text-[11px] font-semibold uppercase tracking-wider",
          hasError ? "text-red-500" : "text-foreground/60",
        )}
      >
        {label}
        {required && <span className="ml-0.5 text-accent">*</span>}
        {optional && (
          <span className="ml-1 font-normal normal-case text-muted-foreground">
            (optional)
          </span>
        )}
      </label>

      <div className="flex items-end gap-2">
        <Select
          value={currentValue || undefined}
          onValueChange={handleChange}
          disabled={disabled}
        >
          <SelectTrigger
            className={cn(
              "w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-primary/20",
              hasError
                ? "border-red-400 focus:ring-red-200"
                : "border-border hover:border-primary/40",
            )}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>

          <SelectContent className="max-h-64 rounded-xl">
            {/* Search box */}
            {searchable && (
              <div className="sticky top-0 z-10 flex items-center gap-2 bg-popover p-2">
                <DebouncedInput
                  placeholder="Search…"
                  value={query}
                  debounce={debounceTime}
                  onChange={(v) => setQuery(v.toString())}
                />
                {isFetching ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
                ) : query ? (
                  <X
                    className="h-4 w-4 shrink-0 cursor-pointer text-muted-foreground hover:text-foreground"
                    onClick={() => setQuery("")}
                  />
                ) : null}
              </div>
            )}

            {/* Empty state */}
            {filtered.length === 0 && !isFetching && (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                No results found
              </div>
            )}

            {/* Options */}
            {filtered.map((opt) => (
              <SelectItem key={String(opt.value)} value={String(opt.value)}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Inline "Add" slot */}
        {addComponent && <div className="shrink-0">{addComponent}</div>}
      </div>

      {/* Inline error */}
      <FieldError field={field} />
    </div>
  );
}
