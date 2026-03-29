import { stripHtml } from "@/lib/strip-html";
import { Event } from "@/lib/types";

export function EventJsonLd({ event }: { event: Event }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: stripHtml(event.description ?? ""),
    startDate: event.start_datetime,
    endDate: event.end_datetime,
    location: event.is_online
      ? { "@type": "VirtualLocation", url: event.online_url }
      : {
          "@type": "Place",
          name: event.location?.name,
          geo: {
            "@type": "GeoCoordinates",
            latitude: event.location?.latitude,
            longitude: event.location?.longitude,
          },
        },
    image: event.cover_image,
    offers: event.is_paid
      ? {
          "@type": "Offer",
          price: event.price,
          priceCurrency: "NPR",
          availability: "https://schema.org/InStock",
        }
      : { "@type": "Offer", price: 0, priceCurrency: "NPR" },
    organizer: {
      "@type": "Organization",
      name: event.organizer?.name,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
