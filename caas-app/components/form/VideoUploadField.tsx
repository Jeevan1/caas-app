"use client";

import React, { useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Single-mode props ────────────────────────────────────────────────────────
export interface VideoUploadFieldSingleProps {
  multiple?: false;
  value: File | null;
  onChange: (file: File | null) => void;
  id?: string;
  label?: string;
  hint?: string;
  maxSizeMB?: number;
}

// ─── Multiple-mode props ──────────────────────────────────────────────────────
export interface VideoUploadFieldMultipleProps {
  multiple: true;
  value: File[];
  onChange: (files: File[]) => void;
  id?: string;
  label?: string;
  hint?: string;
  maxSizeMB?: number;
}

export type VideoUploadFieldProps =
  | VideoUploadFieldSingleProps
  | VideoUploadFieldMultipleProps;

// ─── Per-file preview card ────────────────────────────────────────────────────
function VideoPreviewCard({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) {
  // Stable object URL for this file instance
  const src = useMemo(() => URL.createObjectURL(file), [file]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-black aspect-video">
      <video src={src} controls className="w-full h-full" />
      <Button
        type="button"
        variant="destructive"
        size="icon"
        className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-80 hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      >
        <X className="h-4 w-4" />
      </Button>
      <div className="absolute bottom-2 left-2 max-w-[80%] truncate rounded-full bg-foreground/60 px-2.5 py-1 text-[10px] font-semibold text-background backdrop-blur-sm">
        {file.name}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function VideoUploadField(props: VideoUploadFieldProps) {
  const {
    multiple = false,
    id = "video-upload",
    label = multiple ? "Upload videos" : "Upload video",
    hint,
    maxSizeMB = 500,
  } = props;

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Normalise to array for internal logic
  const files: File[] = multiple
    ? (props as VideoUploadFieldMultipleProps).value
    : (props as VideoUploadFieldSingleProps).value
      ? [(props as VideoUploadFieldSingleProps).value as File]
      : [];

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const maxBytes = maxSizeMB * 1024 * 1024;
    const valid: File[] = [];
    Array.from(incoming).forEach((f) => {
      if (!f.type.startsWith("video/")) return;
      if (f.size > maxBytes) return;
      valid.push(f);
    });
    if (!valid.length) return;
    if (multiple) {
      const p = props as VideoUploadFieldMultipleProps;
      p.onChange([...p.value, ...valid]);
    } else {
      (props as VideoUploadFieldSingleProps).onChange(valid[0]);
    }
  };

  const removeFile = (index: number) => {
    if (multiple) {
      const p = props as VideoUploadFieldMultipleProps;
      p.onChange(p.value.filter((_, i) => i !== index));
    } else {
      (props as VideoUploadFieldSingleProps).onChange(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Preview cards — shown for every queued file (single or multiple) */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {files.map((f, i) => (
            <VideoPreviewCard
              key={`${f.name}-${f.size}-${i}`}
              file={f}
              onRemove={() => removeFile(i)}
            />
          ))}
        </div>
      )}

      {/* Drop zone — always visible so more files can be added */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "relative flex min-h-[120px] cursor-pointer flex-col items-center justify-center",
          "overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-200",
          "border-border bg-muted/20 hover:border-primary/40 hover:bg-muted/40",
          files.length > 0 && "min-h-[80px]",
        )}
      >
        <input
          id={id}
          type="file"
          accept="video/*"
          multiple={multiple}
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <div className="flex flex-col items-center gap-2 p-5 text-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
            <UploadCloud className="h-4.5 w-4.5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {files.length > 0
                ? multiple
                  ? "Add more videos"
                  : "Replace video"
                : label}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {hint ??
                `MP4, WebM or Ogg · Max ${maxSizeMB} MB${multiple ? " · multiple allowed" : ""}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
