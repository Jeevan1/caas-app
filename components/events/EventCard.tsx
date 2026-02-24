import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/helpers";
import { Event } from "@/lib/types";
import { Calendar, Globe } from "lucide-react";
const nearbyEvents = [
  {
    id: 1,
    title: "Startup Pitch Night & Networking",
    group: "Entrepreneurs of Kathmandu",
    date: "Thu, Feb 20 · 6:00 PM",
    attendees: 42,
    emoji: "🚀",
  },
  {
    id: 2,
    title: "Weekend Hike: Shivapuri Hills Trail",
    group: "Kathmandu Outdoor Club",
    date: "Sat, Feb 22 · 7:00 AM",
    attendees: 67,
    emoji: "🏔️",
  },
  {
    id: 3,
    title: "Digital Marketing Masterclass",
    group: "Growth Hackers Nepal",
    date: "Sun, Feb 23 · 2:00 PM",
    attendees: 89,
    emoji: "📊",
  },
  {
    id: 4,
    title: "Photography Walk: Thamel District",
    group: "Nepal Street Photographers",
    date: "Sat, Feb 22 · 9:00 AM",
    attendees: 23,
    emoji: "📸",
  },
  {
    id: 5,
    title: "Book Club: The Lean Startup",
    group: "Kathmandu Readers Circle",
    date: "Wed, Feb 19 · 5:30 PM",
    attendees: 18,
    emoji: "📚",
  },
  {
    id: 6,
    title: "Open Mic Night & Jam Session",
    group: "Kathmandu Music Community",
    date: "Fri, Feb 21 · 7:00 PM",
    attendees: 54,
    emoji: "🎵",
  },
];

function EventCard({
  event,
  online = false,
  index,
}: {
  event: Event;
  online?: boolean;
  index?: number;
}) {
  return (
    <Link
      href={`/events/${event.idx}`}
      className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden transition-all hover:border-primary/40 hover:shadow-md"
      style={{ animationDelay: `${index && (index % 10) * 40}ms` }}
    >
      {/* Cover image area */}
      <div className="relative flex h-36 w-full items-center justify-center bg-muted text-5xl">
        {event.cover_image && (
          <img
            src={event.cover_image}
            alt={event.title}
            className="h-full w-full object-cover"
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
        {/* Stacked avatar placeholders */}
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
          {event.total_attendees} attendees
        </span>
      </div>
    </Link>
  );
}

export { EventCard };
