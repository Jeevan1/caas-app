import { Link } from "@/i18n/navigation";
import { ArrowRight, MapPin, CalendarX } from "lucide-react";
import { Button } from "../ui/button";
import { EventCard } from "../events/EventCard";
import { serverFetch } from "@/lib/server-fetch";
import { Suspense } from "react";
import { EventCardGridLoader } from "../fallback/EventCardSkeleton";
import { Event, PaginatedAPIResponse } from "@/lib/types";

const getEvents = async () => {
  const res = await serverFetch<PaginatedAPIResponse<Event>>("/event/events/");
  return res;
};

export async function NearbyEventsSection() {
  const events = await getEvents();
  const hasEvents = (events?.results?.length ?? 0) > 0;

  return (
    <section className="bg-background py-14 md:py-20">
      <div className="container mx-auto">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="mb-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              Near you
            </p>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Events near Kathmandu
            </h2>
          </div>
          {hasEvents && (
            <Link href="/events">
              <Button
                variant="ghost"
                size="sm"
                className="hidden gap-1.5 sm:flex"
              >
                See all events <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>

        <Suspense fallback={<EventCardGridLoader />}>
          {hasEvents ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {events?.results.map((event) => (
                <EventCard key={event.idx} event={event} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border bg-muted/30 py-20 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <CalendarX className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-heading text-lg font-semibold text-foreground">
                  No events near Kathmandu
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Nothing scheduled nearby yet — explore events in other
                  locations.
                </p>
              </div>
              <Link href="/find">
                <Button variant="outline" size="sm" className="gap-2">
                  Browse all events <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </Suspense>

        {hasEvents && (
          <div className="mt-6 text-center sm:hidden">
            <Link href="/find">
              <Button variant="outline" className="gap-2">
                See all events <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
