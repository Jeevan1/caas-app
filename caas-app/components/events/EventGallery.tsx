import { useApiQuery } from "@/lib/hooks/use-api-query";
import { GalleryImage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Images } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Lightbox } from "../Lightbox";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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

const EventGallery = ({
  eventId,
  className,
}: {
  eventId: string;
  className?: string;
}) => {
  const { data: galleryData, isLoading } = useApiQuery<{
    results: GalleryImage[];
  }>({
    url: `/api/event/events/${eventId}/images/`,
    queryKey: ["event", "gallery", eventId],
  });

  const [lightbox, setLightbox] = useState<number | null>(null);

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

  return (
    <>
      <Carousel
        opts={{
          align: "start",
          loop: images.length > 4,
        }}
        className={cn("w-full px-8 sm:px-0", className)}
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {images.map((img, idx) => (
            <CarouselItem
              key={img.idx}
              className="pl-2 sm:basis-1/2 md:pl-4 lg:basis-1/3 xl:basis-1/4"
            >
              <div
                className="group relative cursor-zoom-in overflow-hidden rounded-xl bg-muted"
                style={{ aspectRatio: "1/1" }}
                onClick={() => setLightbox(idx)}
              >
                <Image
                  src={img.image}
                  alt={img.caption ?? "Photo"}
                  fill
                  sizes="(max-width: 320px) 100vw, (max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {img.caption && (
                  <div className="absolute inset-x-0 bottom-0 translate-y-full bg-black/60 px-2 py-1.5 text-[11px] text-white transition-transform duration-200 group-hover:translate-y-0">
                    {img.caption}
                  </div>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {images.length > 1 && (
          <>
            <CarouselPrevious className="absolute -left-3 sm:-left-12" />
            <CarouselNext className="absolute -right-3 sm:-right-12" />
          </>
        )}
      </Carousel>

      {lightbox !== null && (
        <Lightbox
          images={images}
          initialIndex={lightbox}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
};

export default EventGallery;
