import { Event } from "@/lib/types";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const res = await fetch(
      `${process.env.MASTER_URL}/event/events/?page_size=100`,
    );

    if (!res.ok) return staticRoutes();

    const data = await res.json();
    const events = (data.results ?? [])
      .filter((event: Event) => !!event.idx)
      .map((event: Event) => {
        const rawDate = event.start_datetime ?? event.end_datetime;
        const date = rawDate ? new Date(rawDate) : new Date();
        const lastModified = isNaN(date.getTime()) ? new Date() : date;

        return {
          url: `https://joinyourevent.com/events/${event.idx}`,
          lastModified,
          changeFrequency: "weekly" as const,
          priority: 0.8,
        };
      });

    return [...staticRoutes(), ...events];
  } catch {
    return staticRoutes();
  }
}

function staticRoutes(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: "https://joinyourevent.com", lastModified: now, priority: 1 },
    {
      url: "https://joinyourevent.com/events",
      lastModified: now,
      priority: 0.9,
    },
  ];
}
