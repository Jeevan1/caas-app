import { useApiQuery } from "@/lib/hooks/use-api-query";
import { GalleryImage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Images } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

function GallerySkeleton() {
  return (
    <div className="grid grid-cols-3 gap-2">
      <div
        className="col-span-1 animate-pulse rounded-2xl bg-muted/70"
        style={{ aspectRatio: "16/9" }}
      />
      <div
        className="col-span-1 animate-pulse rounded-2xl bg-muted/70"
        style={{ aspectRatio: "16/9" }}
      />
      <div
        className="col-span-1 animate-pulse rounded-2xl bg-muted/70"
        style={{ aspectRatio: "16/9" }}
      />
    </div>
  );
}

const EventGallery = ({ eventId }: { eventId: string }) => {
  const { data: galleryData, isLoading } = useApiQuery<{
    results: GalleryImage[];
  }>({
    url: `/api/event/events/${eventId}/images/`,
    queryKey: ["event", "gallery", eventId],
  });

  const [lightbox, setLightbox] = useState<string | null>(null);

  if (isLoading) return <GallerySkeleton />;

  const images = galleryData?.results ?? [];
  if (!images.length) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-14 text-center">
        <Images className="h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No gallery images yet.</p>
      </div>
    );
  }

  const [first, ...rest] = images;

  return (
    <>
      <div
        className={cn(
          "grid gap-2",
          images.length === 1
            ? "grid-cols-1"
            : images.length === 2
              ? "grid-cols-2"
              : "grid-cols-3",
        )}
      >
        <div
          className={cn(
            "relative cursor-zoom-in overflow-hidden rounded-2xl bg-muted",
            images.length >= 3 && "col-span-2",
          )}
          style={{ aspectRatio: images.length >= 3 ? "16/9" : "4/3" }}
          onClick={() => setLightbox(first.image)}
        >
          <Image
            src={first.image}
            alt={first.caption ?? "Photo"}
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>

        {rest.map((img) => (
          <div
            key={img.idx}
            className="relative cursor-zoom-in overflow-hidden rounded-xl bg-muted"
            style={{ aspectRatio: "1/1" }}
            onClick={() => setLightbox(img.image)}
          >
            <Image
              src={img.image}
              alt={img.caption ?? "Photo"}
              fill
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
        ))}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
            onClick={(e) => {
              e.stopPropagation();
              setLightbox(null);
            }}
          >
            ✕
          </button>
          <Image
            src={lightbox}
            alt="Preview"
            width={1200}
            height={800}
            className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}
    </>
  );
};

export default EventGallery;
