"use client";
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/helpers";
import { Event } from "@/lib/types";
import { Calendar, Globe } from "lucide-react";
import { useApiMutation } from "@/lib/utils";
import { trackEventClick } from "@/lib/gtag";
import Image from "next/image";

function EventCard({
  event,
  online = false,
  index,
}: {
  event: Event;
  online?: boolean;
  index?: number;
}) {
  const { mutate: mutateClick } = useApiMutation({
    apiPath: `/api/event/events/${event.idx}/click/`,
    method: "POST",
    queryKey: `event-click-${event.idx}`,
    showSuccessuseToast: false,
  });

  return (
    <Link
      href={`/events/${event.idx}`}
      onClick={() => {
        mutateClick({});
        trackEventClick(event.idx, event.title);
      }}
      className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden transition-all hover:border-primary/40 hover:shadow-md"
      style={{ animationDelay: `${index && (index % 10) * 40}ms` }}
    >
      {/* Cover image area */}
      <div className="relative flex h-36 w-full items-center justify-center bg-muted text-5xl">
        {event.cover_image && (
          <Image
            src={event.cover_image}
            alt={`${event.title} — ${event.location?.name ? `Held at ${event.location.name}` : "Event cover image"}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={index !== undefined && index < 4}
          />
        )}
        <span className="absolute left-3 top-3 rounded-full bg-secondary/90 px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
          {event.is_paid ? "Paid" : "Free"}
        </span>
        {online && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-card/90 px-2.5 py-0.5 text-xs font-medium text-foreground">
            <Globe className="h-3 w-3" /> Online
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Calendar className="h-3 w-3 shrink-0" />
          {formatDate(event.start_datetime)}-{formatDate(event.end_datetime)}
        </p>
        <h3 className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
          {event.title}
        </h3>
        <p className="text-xs text-muted-foreground mt-auto">
          by {event.organizer?.name ?? "Publisher"}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 border-t border-border px-4 py-3">
        <div className="flex -space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-6 w-6 rounded-full border-2 border-card bg-primary/10 text-[9px] font-bold text-primary flex items-center justify-center"
            >
              {String.fromCharCode(65 + i)}
            </div>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">
          {event.joined_attendees} attendees
        </span>
      </div>
    </Link>
  );
}

export { EventCard };
