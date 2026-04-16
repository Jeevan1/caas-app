"use client";

import { useApiQuery } from "@/lib/hooks/use-api-query";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Video, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EventVideo {
  idx: string;
  video: string;
  title?: string;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function VideoGallerySkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl bg-muted/70"
          style={{ aspectRatio: "16/9" }}
        />
      ))}
    </div>
  );
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function VideoLightbox({
  videos,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  videos: EventVideo[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const video = videos[index];
  const hasPrev = index > 0;
  const hasNext = index < videos.length - 1;

  // Keyboard navigation for prev/next (Escape is handled by Dialog)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && hasPrev) onPrev();
      if (e.key === "ArrowRight" && hasNext) onNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onPrev, onNext, hasPrev, hasNext]);

  return (
    <Dialog
      open
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="flex h-screen w-screen max-w-[100vw] items-center justify-center border-0 bg-black/90 p-0 shadow-none backdrop-blur-md [&>button]:hidden sm:[&>button]:flex sm:[&>button]:text-white sm:[&>button]:ring-white/20 sm:[&>button]:hover:bg-white/20">
        <DialogTitle className="sr-only">Video preview</DialogTitle>

        {/* Prev button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          disabled={!hasPrev}
          className={cn(
            "absolute left-3 sm:left-6 z-10 flex h-10 w-10 items-center justify-center rounded-full",
            "bg-white/10 text-white backdrop-blur-sm transition-all duration-200",
            "hover:bg-white/25 hover:scale-105",
            !hasPrev && "opacity-30 cursor-not-allowed",
          )}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        {/* Video container */}
        <div
          className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden bg-black shadow-2xl mx-14 sm:mx-20"
          onClick={(e) => e.stopPropagation()}
        >
          <video
            key={video.video}
            src={video.video}
            controls
            autoPlay
            muted
            playsInline
            className="w-full h-full aspect-video object-contain"
          />

          {/* Counter + title bar */}
          <div className="absolute bottom-0 inset-x-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent px-4 py-3 pointer-events-none">
            {video.title ? (
              <span className="text-xs font-semibold text-white/90 truncate max-w-[70%]">
                {video.title}
              </span>
            ) : (
              <span />
            )}
            <span className="text-[11px] font-bold text-white/60 tabular-nums shrink-0">
              {index + 1} / {videos.length}
            </span>
          </div>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Next button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          disabled={!hasNext}
          className={cn(
            "absolute right-3 sm:right-6 z-10 flex h-10 w-10 items-center justify-center rounded-full",
            "bg-white/10 text-white backdrop-blur-sm transition-all duration-200",
            "hover:bg-white/25 hover:scale-105",
            !hasNext && "opacity-30 cursor-not-allowed",
          )}
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const EventVideoGallery = ({
  eventId,
  className,
}: {
  eventId: string;
  className?: string;
}) => {
  const { data, isLoading } = useApiQuery<{ results: EventVideo[] }>({
    url: `/api/event/events/${eventId}/videos/`,
    queryKey: ["event", "videos", eventId],
  });

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const videos = data?.results ?? [];

  const handlePrev = useCallback(
    () => setActiveIndex((i) => (i !== null && i > 0 ? i - 1 : i)),
    [],
  );
  const handleNext = useCallback(
    () =>
      setActiveIndex((i) => (i !== null && i < videos.length - 1 ? i + 1 : i)),
    [videos.length],
  );
  const handleClose = useCallback(() => setActiveIndex(null), []);

  if (isLoading) return <VideoGallerySkeleton />;

  if (!videos.length) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-14 text-center">
        <Video className="h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No videos uploaded yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-3", className)}>
        {videos.map((vid, i) => (
          <div
            key={vid.idx}
            className="group relative cursor-pointer overflow-hidden rounded-2xl bg-black"
            style={{ aspectRatio: "16/9" }}
            onClick={() => setActiveIndex(i)}
          >
            <video
              src={vid.video}
              className="w-full h-full object-contain pointer-events-none"
              muted
              preload="metadata"
            />

            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors duration-200 group-hover:bg-black/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform duration-200 group-hover:scale-110">
                <div className="ml-1 h-0 w-0 border-y-[8px] border-l-[14px] border-y-transparent border-l-black" />
              </div>
            </div>

            {/* Index badge */}
            <div className="absolute top-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-bold text-white/80 tabular-nums">
              {i + 1}
            </div>

            {/* Title badge */}
            {vid.title && (
              <div className="absolute inset-x-0 bottom-0 translate-y-full bg-black/60 px-3 py-2 text-[11px] text-white transition-transform duration-200 group-hover:translate-y-0">
                {vid.title}
              </div>
            )}
          </div>
        ))}
      </div>

      {activeIndex !== null && (
        <VideoLightbox
          videos={videos}
          index={activeIndex}
          onClose={handleClose}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}
    </>
  );
};

export default EventVideoGallery;
