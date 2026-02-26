"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnyFieldApi } from "@tanstack/react-form";

// ─── CHIP COLORS ─────────────────────────────────────────────────────────────
// Cycles through accent palette so each tag looks distinct

const CHIP_COLORS = [
  "bg-primary/10 text-primary border-primary/20",
  "bg-secondary/10 text-secondary border-secondary/20",
  "bg-accent/10 text-accent border-accent/20",
  "bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-400",
  "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400",
  "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
];

function chipColor(index: number) {
  return CHIP_COLORS[index % CHIP_COLORS.length];
}

// ─── STANDALONE COMPONENT ─────────────────────────────────────────────────────

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  label?: string;
  placeholder?: string;
  maxTags?: number;
}

export function TagInput({
  value,
  onChange,
  label = "Tags",
  placeholder = "Type a tag and press Space or Enter…",
  maxTags = 20,
}: TagInputProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function addTag(raw: string) {
    const tag = raw
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "");
    if (!tag || value.includes(tag) || value.length >= maxTags) return;
    onChange([...value, tag]);
  }

  function removeTag(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    // Space or Enter → create tag
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      addTag(input);
      setInput("");
      return;
    }
    // Backspace on empty input → remove last tag
    if (e.key === "Backspace" && !input && value.length) {
      removeTag(value.length - 1);
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    // Support pasting comma or space separated tags
    const newTags = pasted
      .split(/[\s,]+/)
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    const merged = [...new Set([...value, ...newTags])].slice(0, maxTags);
    onChange(merged);
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-foreground">{label}</label>
      )}

      {/* Tag container — click anywhere to focus input */}
      <div
        className={cn(
          "flex min-h-[42px] flex-wrap gap-1.5 rounded-xl border border-border bg-background px-3 py-2 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 cursor-text",
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Chips */}
        {value.map((tag, i) => (
          <span
            key={tag}
            className={cn(
              "flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all",
              "animate-in fade-in zoom-in-95 duration-150",
              chipColor(i),
            )}
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(i);
              }}
              className="rounded-full opacity-60 hover:opacity-100 transition-opacity"
              aria-label={`Remove ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        {/* Input */}
        {value.length < maxTags && (
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={value.length === 0 ? placeholder : ""}
            className="min-w-[120px] flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
          />
        )}
      </div>

      <p className="text-[11px] text-muted-foreground">
        Press{" "}
        <kbd className="rounded border border-border bg-muted px-1 py-px text-[10px] font-mono">
          Space
        </kbd>{" "}
        or{" "}
        <kbd className="rounded border border-border bg-muted px-1 py-px text-[10px] font-mono">
          Enter
        </kbd>{" "}
        to add · Backspace to remove
      </p>
    </div>
  );
}

// ─── TANSTACK FORM WRAPPER ────────────────────────────────────────────────────

export function FieldTagInput({
  field,
  label,
  placeholder,
  maxTags,
}: {
  field: AnyFieldApi;
  label?: string;
  placeholder?: string;
  maxTags?: number;
}) {
  const tags: string[] = Array.isArray(field.state.value)
    ? field.state.value
    : [];
  const error = field.state.meta.isTouched && field.state.meta.errors?.[0];

  return (
    <div className="flex flex-col gap-1.5">
      <TagInput
        value={tags}
        onChange={(next) => {
          field.handleChange(next);
          field.handleBlur();
        }}
        label={label}
        placeholder={placeholder}
        maxTags={maxTags}
      />
      {error && (
        <p className="text-xs font-medium text-destructive">{String(error)}</p>
      )}
    </div>
  );
}
