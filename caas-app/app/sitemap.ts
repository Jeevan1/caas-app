import { Event } from "@/lib/types";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const res = await fetch(
      `${process.env.MASTER_URL}/event/events/?page_size=500`,
      { cache: "no-store" },
    );

    if (!res.ok) return staticRoutes();

    const data = await res.json();

    const now = new Date();

    const events = (data.results ?? [])
      .filter((event: Event) => !!event.idx)
      .map((event: Event) => {
        const rawDate = event.start_datetime ?? event.end_datetime;
        const date = rawDate ? new Date(rawDate) : now;
        const lastModified = isNaN(date.getTime()) ? now : date;

        const isFuture = lastModified > now;

        return {
          url: `https://joinyourevent.com/events/${event.idx}`,
          lastModified,
          changeFrequency: isFuture ? "daily" : "monthly",
          priority: isFuture ? 0.8 : 0.5,
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
    { url: "https://joinyourevent.com/about", lastModified: now, priority: 0.8 },
    { url: "https://joinyourevent.com/contact", lastModified: now, priority: 0.8 },
    { url: "https://joinyourevent.com/pricing", lastModified: now, priority: 0.8 },
    { url: "https://joinyourevent.com/how-it-works", lastModified: now, priority: 0.8 },
    { url: "https://joinyourevent.com/blog", lastModified: now, priority: 0.8 },
  ];
}
