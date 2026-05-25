import { stripHtml } from "@/lib/strip-html";
import { Event } from "@/lib/types";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

// ─── Primitive renderer ───────────────────────────────────────────────────────
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ─── WebSite (sitelinks searchbox) ───────────────────────────────────────────
export function WebSiteJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE_NAME,
        url: SITE_URL,
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/events?search={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

// ─── Organization ─────────────────────────────────────────────────────────────
export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/logo.png`,
        sameAs: [
          "https://twitter.com/joinyourevent",
          "https://facebook.com/joinyourevent",
        ],
      }}
    />
  );
}

// ─── BreadcrumbList ───────────────────────────────────────────────────────────
export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}

// ─── FAQPage ─────────────────────────────────────────────────────────────────
export function FAQPageJsonLd({
  questions,
}: {
  questions: { question: string; answer: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: questions.map((q) => ({
          "@type": "Question",
          name: q.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: q.answer,
          },
        })),
      }}
    />
  );
}

// ─── Event ───────────────────────────────────────────────────────────────────
export function EventJsonLd({ event }: { event: Event }) {
  const url = `${SITE_URL}/events/${event.idx}`;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: stripHtml(event.description ?? ""),
    startDate: event.start_datetime,
    endDate: event.end_datetime,
    url,
    eventStatus:
      event.status === 1
        ? "https://schema.org/EventScheduled"
        : "https://schema.org/EventCancelled",
    eventAttendanceMode: event.is_online
      ? "https://schema.org/OnlineEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
    location: event.is_online
      ? { "@type": "VirtualLocation", url: event.online_url }
      : {
          "@type": "Place",
          name: event.location?.name,
          address: { "@type": "PostalAddress", name: event.location?.name },
          geo: {
            "@type": "GeoCoordinates",
            latitude: event.location?.latitude,
            longitude: event.location?.longitude,
          },
        },
    image: event.cover_image
      ? [{ "@type": "ImageObject", url: event.cover_image }]
      : undefined,
    offers: {
      "@type": "Offer",
      price: event.is_paid ? event.price : 0,
      priceCurrency: "NPR",
      availability: "https://schema.org/InStock",
      url,
    },
    organizer: {
      "@type": "Organization",
      name: event.organizer?.name,
      url: event.organizer?.idx
        ? `${SITE_URL}/organizer/${event.organizer.idx}`
        : undefined,
    },
  };

  return <JsonLd data={jsonLd} />;
}
