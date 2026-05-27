import { EventJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import EventDetails from "@/components/events/EventDetails";
import { EVENTS_QUERY_KEY, SINGLE_EVENT_QUERY_KEY } from "@/constants";
import { serverFetch } from "@/lib/server-fetch";
import { stripHtml } from "@/lib/strip-html";
import { Event, PaginatedAPIResponse } from "@/lib/types";
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE, buildLocaleAlternates } from "@/lib/seo";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  const res = await fetch(`${process.env.MASTER_URL}/event/events/${id}/`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    return {
      title: "Event",
      description: `Discover and join events on ${SITE_NAME}.`,
    };
  }

  const event: Event = await res.json();
  const path        = `/events/${id}`;
  const url         = `${SITE_URL}${path}`;
  const title       = event.title;
  const description =
    stripHtml(event.description, 160) ||
    `Join ${event.title} on ${SITE_NAME}.`;

  // cover_image is always a full absolute URL from the backend
  const image = event.cover_image ?? DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "article",
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card:   "summary_large_image",
      site:   "@joinyourevent",
      title,
      description,
      images: [image],
    },
    alternates: buildLocaleAlternates(path),
    robots: { index: true, follow: true },
  };
}

const getEventById = async (id: string) => {
  const res = await serverFetch<Event>(`/event/events/${id}/`);
  return res;
};

const getRelatedEvents = async (id: string) => {
  const res = await serverFetch<PaginatedAPIResponse<Event>>(`/event/events/`);
  return res;
};

const EventDetailsPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: SINGLE_EVENT_QUERY_KEY(id),
      queryFn: () => getEventById(id),
    }),
    queryClient.prefetchQuery({
      queryKey: EVENTS_QUERY_KEY,
      queryFn: () => getRelatedEvents(id),
    }),
  ]);
  const eventData = queryClient.getQueryData<Event>(SINGLE_EVENT_QUERY_KEY(id));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {eventData && (
        <>
          <EventJsonLd event={eventData} />
          <BreadcrumbJsonLd
            items={[
              { name: "Events", url: "https://joinyourevent.com/events" },
              {
                name: eventData.title,
                url: `https://joinyourevent.com/events/${id}`,
              },
            ]} 
          />
        </>
      )}
      <div className="container mx-auto px-6 pt-6">
        <Breadcrumbs
          items={[
            { name: "Events", href: "/events" },
            { name: eventData?.title ?? "Event" },
          ]}
        />
      </div>
      <EventDetails eventId={id} />
    </HydrationBoundary>
  );
};

export default EventDetailsPage;
