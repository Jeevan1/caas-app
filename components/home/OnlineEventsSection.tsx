import { Link } from "@/i18n/navigation";
import { ArrowRight, Globe, CalendarX } from "lucide-react";
import { Button } from "../ui/button";
import { EventCard } from "../events/EventCard";
import { serverFetch } from "@/lib/server-fetch";
import { Event, PaginatedAPIResponse } from "@/lib/types";
import { Suspense } from "react";
import { EventCardGridLoader } from "../fallback/EventCardSkeleton";

const getEvents = async () => {
  const res = await serverFetch<PaginatedAPIResponse<Event>>("/event/events/");
  return res;
};

export async function OnlineEventsSection() {
  const events = await getEvents();
  const hasEvents = (events?.results?.length ?? 0) > 0;

  return (
    <section className="bg-card py-20">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="mb-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Globe className="h-3.5 w-3.5 text-secondary" />
              Online · Join from anywhere
            </p>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Upcoming online events
            </h2>
          </div>
          {hasEvents && (
            <Link href="/find/online">
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {events?.results.map((event) => (
                <EventCard key={event.idx} event={event} online />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border bg-muted/30 py-20 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <CalendarX className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-heading text-lg font-semibold text-foreground">
                  No upcoming events
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Check back soon — new online events are added regularly.
                </p>
              </div>
              <Link href="/find/online">
                <Button variant="outline" size="sm" className="gap-2">
                  Browse all events <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </Suspense>

        {hasEvents && (
          <div className="mt-6 text-center sm:hidden">
            <Link href="/find/online">
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
