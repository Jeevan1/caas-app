import { useApiQuery } from "@/lib/hooks/use-api-query";
import { Attendee } from "@/lib/types";
import { CheckCircle2, Users } from "lucide-react";
import Image from "next/image";

function AttendeeSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-muted/70" />
      <div className="flex flex-col gap-1.5">
        <div className="h-3.5 w-28 animate-pulse rounded-md bg-muted/70" />
        <div className="h-3 w-16 animate-pulse rounded-md bg-muted/50" />
      </div>
      <div className="ml-auto h-4 w-4 animate-pulse rounded-full bg-muted/50" />
    </div>
  );
}

const Attendees = ({ eventId }: { eventId: string }) => {
  const { data: attendees, isLoading: isAttendLoading } = useApiQuery<
    Attendee[]
  >({
    url: `/api/event/events/${eventId}/attendees/`,
    queryKey: ["event", "attendees", eventId],
  });

  if (isAttendLoading) {
    return (
      <div className="tc mt-5 flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <AttendeeSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!attendees || attendees.length === 0) {
    return (
      <div className="mt-5 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
          <Users className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            No attendees yet
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Be the first to join this event.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="tc mt-5 flex flex-col gap-2">
      {attendees.map((a, i) => (
        <div
          key={a.idx ?? a.name}
          className="ac flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-[11px] font-bold text-primary">
            {a.image ? (
              <Image
                src={a.image}
                alt={a.name}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              a.name.charAt(0).toUpperCase()
            )}
          </div>

          <p className="text-sm font-semibold text-foreground">{a.name}</p>

          <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-secondary" />
        </div>
      ))}
    </div>
  );
};

export default Attendees;
