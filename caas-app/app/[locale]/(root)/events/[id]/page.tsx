import { EventJsonLd } from "@/components/EventJsonLd";
import EventDetails from "@/components/events/EventDetails";
import { EVENTS_QUERY_KEY, SINGLE_EVENT_QUERY_KEY } from "@/constants";
import { serverFetch } from "@/lib/server-fetch";
import { Event, PaginatedAPIResponse } from "@/lib/types";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  const res = await fetch(`${process.env.MASTER_URL}/event/events/${id}/`, {
    cache: "force-cache",
  });

  if (!res.ok) {
    return {
      title: "Event | Join Your Event",
      description: "Discover and join events on Join Your Event Platform.",
    };
  }

  const event: Event = await res.json();

  const title = `${event.title} | Join Your Event`;
  const description =
    event.description?.slice(0, 160) ??
    "Join this event on Join Your Event Platform.";
  const image =
    event.cover_image ?? "https://caas-app-pro.netlify.app/og-default.png";
  const url = `https://joinyourevent.com/events/${id}`;

  return {
    title,
    description,

    openGraph: {
      title,
      description,
      url,
      siteName: "Join Your Event",
      type: "website",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: event.title,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },

    alternates: {
      canonical: url,
    },

    robots: {
      index: true,
      follow: true,
    },
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
      {eventData && <EventJsonLd event={eventData} />}
      <EventDetails eventId={id} />
    </HydrationBoundary>
  );
};

export default EventDetailsPage;
