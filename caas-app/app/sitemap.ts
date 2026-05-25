import { MetadataRoute } from "next";
import { SITE_URL, LOCALES, buildSitemapAlternates } from "@/lib/seo";
import { Event, Category, PaginatedAPIResponse } from "@/lib/types";

// ─── Static routes ────────────────────────────────────────────────────────────
function staticRoutes(): MetadataRoute.Sitemap {
  const now = new Date();

  const pages = [
    { path: "",             changeFrequency: "weekly"  as const, priority: 1.0 },
    { path: "/events",      changeFrequency: "hourly"  as const, priority: 0.9 },
    { path: "/category",    changeFrequency: "weekly"  as const, priority: 0.8 },
    { path: "/how-it-works",changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/about",       changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/blog",        changeFrequency: "weekly"  as const, priority: 0.6 },
    { path: "/pricing",     changeFrequency: "monthly" as const, priority: 0.5 },
    { path: "/contact",     changeFrequency: "monthly" as const, priority: 0.6 },
  ] as const;

  return pages.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
    alternates: {
      languages: LOCALES.reduce<Record<string, string>>(
        (acc, locale) => {
          acc[locale] = `${SITE_URL}/${locale}${path}`;
          return acc;
        },
        { "x-default": `${SITE_URL}${path}` },
      ) as Record<string, string>,
    },
  }));
}

// ─── Dynamic: events ─────────────────────────────────────────────────────────
async function fetchEvents(): Promise<MetadataRoute.Sitemap> {
  try {
    const res = await fetch(
      `${process.env.MASTER_URL}/event/events/?page_size=500`,
      { next: { revalidate: 3600 } },
    );

    if (!res.ok) return [];

    const data = await res.json();
    const now  = new Date();

    return (data.results ?? [])
      .filter((event: Event) => !!event.idx)
      .map((event: Event) => {
        const rawDate    = event.start_datetime ?? event.end_datetime;
        const date       = rawDate ? new Date(rawDate) : now;
        const lastModified = isNaN(date.getTime()) ? now : date;
        const isFuture   = lastModified > now;
        const path       = `/events/${event.idx}`;

        return {
          url: `${SITE_URL}${path}`,
          lastModified,
          changeFrequency: (isFuture ? "daily" : "monthly") as "daily" | "monthly",
          priority:        isFuture ? 0.8 : 0.5,
          alternates:      buildSitemapAlternates(path),
        } as MetadataRoute.Sitemap[number];
      });
  } catch {
    return [];
  }
}

// ─── Dynamic: categories ─────────────────────────────────────────────────────
async function fetchCategories(): Promise<MetadataRoute.Sitemap> {
  try {
    const res = await fetch(
      `${process.env.MASTER_URL}/event/categories/`,
      { next: { revalidate: 3600 } },
    );

    if (!res.ok) return [];

    const data  = await res.json();
    const now   = new Date();
    const items: Category[] = Array.isArray(data)
      ? data
      : (data as PaginatedAPIResponse<Category>).results ?? [];

    return items
      .filter((cat) => !!cat.idx)
      .map((cat) => {
        const path = `/category/${cat.idx}`;
        return {
          url: `${SITE_URL}${path}`,
          lastModified: now,
          changeFrequency: "weekly" as const,
          priority: 0.7,
          alternates: buildSitemapAlternates(path),
        };
      });
  } catch {
    return [];
  }
}

// ─── Entry point ─────────────────────────────────────────────────────────────
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [events, categories] = await Promise.all([
    fetchEvents(),
    fetchCategories(),
  ]);

  return [...staticRoutes(), ...events, ...categories];
}
