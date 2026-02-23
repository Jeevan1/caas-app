"use client";

import { useRef, useState } from "react";
import { CheckCircle2, ImageIcon, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnyFieldApi } from "@tanstack/react-form";
import FieldError from "./FIeldError";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface ImageUploadSingleProps {
  multiple?: false;
  value: File | null;
  onChange: (f: File | null) => void;
}

interface ImageUploadMultipleProps {
  multiple: true;
  value: File[];
  onChange: (files: File[]) => void;
}

type ImageUploadProps = (ImageUploadSingleProps | ImageUploadMultipleProps) & {
  maxSizeMB?: number;
  label?: string;
  hint?: string;
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function toPreview(file: File) {
  return URL.createObjectURL(file);
}

// ─── PREVIEW THUMB ────────────────────────────────────────────────────────────

function Thumb({ file, onRemove }: { file: File; onRemove: () => void }) {
  return (
    <div className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border">
      <img
        src={toPreview(file)}
        alt={file.name}
        className="h-full w-full object-cover"
      />
      {/* Remove button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className={cn(
          "absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full",
          "bg-foreground/70 text-background transition-colors hover:bg-foreground",
          "opacity-0 group-hover:opacity-100",
        )}
      >
        <X className="h-2.5 w-2.5" />
      </button>
      {/* Uploaded badge */}
      <div className="absolute bottom-1 left-1 flex items-center gap-0.5 rounded-full bg-secondary/90 px-1.5 py-0.5 text-[9px] font-bold text-secondary-foreground backdrop-blur-sm">
        <CheckCircle2 className="h-2.5 w-2.5" />
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

type FieldImageUploadSingleProps = {
  field: AnyFieldApi; // field.state.value → File | null
  label: string;
  multiple?: false;
  maxSizeMB?: number;
  hint?: string;
};

type FieldImageUploadMultipleProps = {
  field: AnyFieldApi; // field.state.value → File[]
  label: string;
  multiple: true;
  maxSizeMB?: number;
  hint?: string;
};

type FieldImageUploadProps =
  | FieldImageUploadSingleProps
  | FieldImageUploadMultipleProps;

export function FieldImageUpload(props: FieldImageUploadProps) {
  const { field, label, multiple, maxSizeMB, hint } = props;
  const hasError = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <div className="flex flex-col gap-1.5">
      {/* Label */}
      <label
        className={cn(
          "text-[11px] font-semibold uppercase tracking-wider",
          hasError ? "text-red-500" : "text-foreground/60",
        )}
      >
        {label}
      </label>

      {/* ImageUpload wired to field */}
      {multiple ? (
        <ImageUpload
          multiple
          value={(field.state.value as File[]) ?? []}
          onChange={(v) => {
            field.handleChange(v as any);
            field.handleBlur();
          }}
          maxSizeMB={maxSizeMB}
          hint={hint}
        />
      ) : (
        <ImageUpload
          value={(field.state.value as File | null) ?? null}
          onChange={(v) => {
            field.handleChange(v as any);
            field.handleBlur();
          }}
          maxSizeMB={maxSizeMB}
          hint={hint}
        />
      )}

      {/* Inline error */}
      <FieldError field={field} />
    </div>
  );
}

// ─── IMAGE UPLOAD ─────────────────────────────────────────────────────────────

export default function ImageUpload(props: ImageUploadProps) {
  const {
    multiple = false,
    maxSizeMB = 5,
    label = multiple ? "Upload images" : "Upload image",
    hint,
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Normalise to File[] for internal logic
  const files: File[] = multiple
    ? (props as ImageUploadMultipleProps).value
    : (props as ImageUploadSingleProps).value
      ? [(props as ImageUploadSingleProps).value as File]
      : [];

  const hasSinglePreview = !multiple && files.length === 1;

  // ── File validation + dispatch ──────────────────────────────────────────────
  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    setError(null);

    const maxBytes = maxSizeMB * 1024 * 1024;
    const valid: File[] = [];

    Array.from(incoming).forEach((f) => {
      if (!f.type.startsWith("image/")) {
        setError("Only image files are accepted.");
        return;
      }
      if (f.size > maxBytes) {
        setError(`Max file size is ${maxSizeMB} MB.`);
        return;
      }
      valid.push(f);
    });

    if (!valid.length) return;

    if (multiple) {
      const p = props as ImageUploadMultipleProps;
      p.onChange([...p.value, ...valid]);
    } else {
      (props as ImageUploadSingleProps).onChange(valid[0]);
    }
  };

  const removeFile = (index: number) => {
    if (multiple) {
      const p = props as ImageUploadMultipleProps;
      p.onChange(p.value.filter((_, i) => i !== index));
    } else {
      (props as ImageUploadSingleProps).onChange(null);
    }
  };

  // ── Drag handlers ───────────────────────────────────────────────────────────
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(true);
  };
  const handleDragLeave = () => setDrag(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    addFiles(e.dataTransfer.files);
  };

  // ── Single mode: full-area preview ─────────────────────────────────────────
  if (hasSinglePreview) {
    const file = files[0];
    return (
      <div className="relative overflow-hidden rounded-2xl border border-secondary/50 bg-secondary/5">
        <img
          src={toPreview(file)}
          alt="Preview"
          className="max-h-[200px] h-full w-full object-cover"
        />
        <button
          type="button"
          onClick={() => removeFile(0)}
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-foreground/70 text-background transition-colors hover:bg-foreground"
        >
          <X className="h-3 w-3" />
        </button>
        <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-secondary/90 px-2 py-1 text-[10px] font-bold text-secondary-foreground backdrop-blur-sm">
          <CheckCircle2 className="h-3 w-3" /> Uploaded
        </div>
      </div>
    );
  }

  // ── Shared drop zone ────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-2">
      {/* Multiple mode: thumbnail strip above drop zone */}
      {multiple && files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((f, i) => (
            <Thumb
              key={`${f.name}-${i}`}
              file={f}
              onRemove={() => removeFile(i)}
            />
          ))}
        </div>
      )}

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex min-h-[140px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-200",
          drag && "scale-[1.01] border-primary bg-primary/5",
          !drag &&
            "border-border bg-muted/20 hover:border-primary/40 hover:bg-muted/40",
        )}
      >
        <input
          aria-label="Upload images"
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />

        <div className="flex flex-col items-center gap-2 p-6 text-center">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
              drag ? "bg-primary/20" : "bg-muted",
            )}
          >
            {drag ? (
              <Upload className="h-5 w-5 text-primary" />
            ) : (
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {drag ? "Drop to upload" : label}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {hint ??
                `Drag & drop or click · PNG, JPG up to ${maxSizeMB} MB${multiple ? " · multiple allowed" : ""}`}
            </p>
          </div>
        </div>
      </div>

      {/* Validation error */}
      {error && <p className="text-[11px] font-medium text-red-500">{error}</p>}
    </div>
  );
}
