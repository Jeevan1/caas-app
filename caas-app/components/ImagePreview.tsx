"use client";

import { useState, useCallback, useEffect } from "react";
import {
  X,
  ZoomIn,
  ZoomOut,
  Download,
  Maximize2,
  RotateCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface ImagePreviewProps {
  /** Image source — URL string or a File/Blob object */
  src: string | File | null;
  /** Alt text for accessibility */
  alt?: string;
  /** Aspect ratio of the thumbnail container, e.g. "16/9", "1/1", "4/3" */
  aspectRatio?: string;
  /** Optional filename shown in the lightbox header */
  filename?: string;
  /** Allow the lightbox to open on click */
  lightbox?: boolean;
  /** Allow downloading the image */
  downloadable?: boolean;
  /** Extra class names for the thumbnail wrapper */
  className?: string;
  /** Show a remove button (calls onRemove when clicked) */
  onRemove?: () => void;
}

// ─── HOOK: resolve File → object URL ────────────────────────────────────────

function useObjectUrl(src: string | File | null): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!src) {
      setUrl(null);
      return;
    }
    if (typeof src === "string") {
      setUrl(src);
      return;
    }
    const objectUrl = URL.createObjectURL(src);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [src]);

  return url;
}

// ─── LIGHTBOX ────────────────────────────────────────────────────────────────

function Lightbox({
  src,
  alt,
  filename,
  downloadable,
  onClose,
}: {
  src: string;
  alt: string;
  filename?: string;
  downloadable?: boolean;
  onClose: () => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [entered, setEntered] = useState(false);

  // Animate in
  useEffect(() => {
    requestAnimationFrame(() => setEntered(true));
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(z + 0.25, 3));
      if (e.key === "-") setZoom((z) => Math.max(z - 0.25, 0.5));
      if (e.key === "r") setRotation((r) => (r + 90) % 360);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleDownload = useCallback(() => {
    const a = document.createElement("a");
    a.href = src;
    a.download = filename ?? "image";
    a.click();
  }, [src, filename]);

  const displayName =
    filename ?? src.split("/").pop()?.split("?")[0] ?? "image";

  return (
    // Backdrop
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col transition-all duration-300",
        entered ? "opacity-100" : "opacity-0",
      )}
      onClick={onClose}
    >
      {/* Blurred dark backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      {/* ── Header bar ── */}
      <div
        className="relative z-10 flex items-center justify-between gap-4 border-b border-white/10 bg-black/40 px-4 py-3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Filename */}
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-xs">
            🖼️
          </div>
          <p className="truncate text-xs font-semibold text-white/90">
            {displayName}
          </p>
        </div>

        {/* Controls */}
        <div className="flex shrink-0 items-center gap-1">
          {/* Zoom out */}
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
            disabled={zoom <= 0.5}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-30",
            )}
            title="Zoom out (−)"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>

          {/* Zoom level pill */}
          <span className="min-w-[3rem] rounded-md bg-white/10 px-2 py-0.5 text-center text-[11px] font-bold text-white/80">
            {Math.round(zoom * 100)}%
          </span>

          {/* Zoom in */}
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
            disabled={zoom >= 3}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-30"
            title="Zoom in (+)"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>

          {/* Rotate */}
          <button
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
            title="Rotate (R)"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>

          {/* Download */}
          {downloadable && (
            <button
              onClick={handleDownload}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
              title="Download"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Divider */}
          <div className="mx-1 h-5 w-px bg-white/20" />

          {/* Close */}
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
            title="Close (Esc)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Image area ── */}
      <div
        className="relative z-10 flex flex-1 items-center justify-center overflow-hidden p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          className="max-h-full max-w-full select-none rounded-xl object-contain shadow-2xl ring-1 ring-white/10 transition-transform duration-300"
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            cursor: zoom > 1 ? "zoom-out" : "default",
          }}
          onClick={() => zoom > 1 && setZoom(1)}
          draggable={false}
        />
      </div>

      {/* ── Footer hint ── */}
      <div className="relative z-10 border-t border-white/10 bg-black/30 px-4 py-2 text-center">
        <p className="text-[10px] text-white/30">
          Esc to close · +/− to zoom · R to rotate
        </p>
      </div>
    </div>
  );
}

// ─── THUMBNAIL SKELETON ──────────────────────────────────────────────────────

function ThumbnailSkeleton({ aspectRatio }: { aspectRatio: string }) {
  return (
    <div
      className="w-full animate-pulse rounded-2xl bg-muted"
      style={{ aspectRatio }}
    />
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export function ImagePreview({
  src,
  alt = "Preview",
  aspectRatio = "16/9",
  filename,
  lightbox = true,
  downloadable = false,
  className,
  onRemove,
}: ImagePreviewProps) {
  const resolvedSrc = useObjectUrl(src);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Reset load state when src changes
  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [resolvedSrc]);

  if (!src) return null;

  return (
    <>
      {/* ── Thumbnail card ── */}
      <div
        className={cn(
          "group relative overflow-hidden rounded-2xl border border-border bg-muted/30 shadow-sm transition-all duration-300",
          lightbox &&
            !error &&
            "cursor-zoom-in hover:shadow-md hover:border-border/80",
          className,
        )}
        style={{ aspectRatio }}
        onClick={() => {
          if (lightbox && resolvedSrc && !error) setLightboxOpen(true);
        }}
      >
        {/* Loading skeleton */}
        {!loaded && !error && (
          <div className="absolute inset-0 animate-pulse rounded-2xl bg-muted" />
        )}

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
            <span className="text-2xl">🖼️</span>
            <p className="text-[11px] font-medium text-muted-foreground">
              Failed to load image
            </p>
          </div>
        )}

        {/* Image */}
        {resolvedSrc && !error && (
          <img
            src={resolvedSrc}
            alt={alt}
            className={cn(
              "h-full w-full object-cover transition-all duration-500",
              loaded ? "opacity-100 scale-100" : "opacity-0 scale-[1.02]",
              lightbox && "group-hover:scale-[1.03]",
            )}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            draggable={false}
          />
        )}

        {/* ── Hover overlay ── */}
        {lightbox && loaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/30">
            <div className="flex scale-75 items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-3 py-1.5 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
              <Maximize2 className="h-3 w-3 text-white" />
              <span className="text-[11px] font-semibold text-white">
                View full size
              </span>
            </div>
          </div>
        )}

        {/* ── Gradient accent bar (top, matches design system) ── */}
        {loaded && !error && (
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-primary via-secondary to-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        )}

        {/* ── Remove button ── */}
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white/80 opacity-0 backdrop-blur-sm transition-all duration-200 hover:bg-black/80 hover:text-white group-hover:opacity-100"
            title="Remove image"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        {/* ── Download badge ── */}
        {downloadable && loaded && !error && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              const a = document.createElement("a");
              a.href = resolvedSrc!;
              a.download = filename ?? "image";
              a.click();
            }}
            className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white/80 opacity-0 backdrop-blur-sm transition-all duration-200 hover:bg-black/80 hover:text-white group-hover:opacity-100"
            title="Download"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
        )}

        {/* ── Filename chip (bottom-left) ── */}
        {filename && loaded && !error && (
          <div className="absolute bottom-2 left-2 max-w-[60%] truncate rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[10px] font-medium text-white/80 backdrop-blur-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {filename}
          </div>
        )}
      </div>

      {/* ── Lightbox portal ── */}
      {lightboxOpen && resolvedSrc && (
        <Lightbox
          src={resolvedSrc}
          alt={alt}
          filename={filename}
          downloadable={downloadable}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}

export default ImagePreview;
