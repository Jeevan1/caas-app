"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

import { ChevronLeft, ChevronRight } from "lucide-react";

export function Lightbox({
  images,
  initialIndex = 0,
  onClose,
}: {
  images: { image: string; caption?: string | null }[];
  initialIndex?: number;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      } else if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [images.length]);

  if (!images?.length) return null;

  const currentImage = images[currentIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <Dialog
      open
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="flex h-screen w-screen max-w-none flex-col border-0 bg-black/90 p-0 shadow-none backdrop-blur-xl [&>button]:text-white [&>button]:ring-white/20 [&>button]:hover:bg-white/20">
        <DialogTitle className="sr-only">Image preview</DialogTitle>

        {/* Main Image Area */}
        <div className="relative flex flex-1 w-full items-center justify-center p-4 sm:p-12 overflow-hidden">
          {images.length > 1 && (
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white backdrop-blur-md transition-all hover:bg-black/70 sm:left-6"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
          )}

          <div className="relative h-full w-full max-w-[90vw]">
            <Image
              src={currentImage.image}
              alt={currentImage.caption ?? "Preview"}
              fill
              sizes="90vw"
              className="rounded-2xl object-contain shadow-2xl transition-opacity duration-300"
              priority
            />
            {currentImage.caption && (
              <div className="absolute inset-x-0 bottom-6 text-center">
                <span className="rounded-full bg-black/60 px-4 py-2 text-sm text-white backdrop-blur-sm">
                  {currentImage.caption}
                </span>
              </div>
            )}
          </div>

          {images.length > 1 && (
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white backdrop-blur-md transition-all hover:bg-black/70 sm:right-6"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          )}
        </div>

        {/* Thumbnails Row */}
        {images.length > 1 && (
          <div className="w-full shrink-0 bg-black/50 p-4 backdrop-blur-md">
            <div className="mx-auto flex max-w-5xl gap-3 overflow-x-auto pb-2 scrollbar-hide sm:justify-center">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative flex h-16 w-16 shrink-0 overflow-hidden rounded-lg transition-all md:h-20 md:w-20 ${
                    currentIndex === idx
                      ? "scale-105 ring-2 ring-white opacity-100"
                      : "opacity-40 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img.image}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
