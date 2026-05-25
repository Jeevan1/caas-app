import type { Metadata } from "next";

// ─── Site-wide constants ──────────────────────────────────────────────────────
export const SITE_URL  = "https://joinyourevent.com" as const;
export const SITE_NAME = "Join Your Event" as const;
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png` as const;

/** All supported locales (keep in sync with i18n/routing.ts) */
export const LOCALES = ["en", "np", "it"] as const;
export type SiteLocale = (typeof LOCALES)[number];

/** Maps next-intl locale code → Open Graph locale string */
export const OG_LOCALE_MAP: Record<SiteLocale, string> = {
  en: "en_US",
  np: "ne_NP",
  it: "it_IT",
};

// ─── Types ────────────────────────────────────────────────────────────────────
export type BuildMetadataOptions = {
  /** Page title (without site name suffix – the template handles that) */
  title: string;
  /** Meta description – keep ≤ 160 chars */
  description: string;
  /** Absolute path from root, e.g. "/about" or "/events/abc-123" */
  path?: string;
  /** Absolute OG image URL */
  ogImage?: string;
  /** Open Graph type */
  ogType?: "website" | "article";
  /** Suppress search-engine indexing */
  noIndex?: boolean;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
/**
 * Returns `alternates` (canonical + hreflang) for a given path.
 * Automatically produces entries for every supported locale.
 */
export function buildLocaleAlternates(path: string): Metadata["alternates"] {
  const languages = LOCALES.reduce<Record<string, string>>(
    (acc, locale) => {
      acc[locale] = `${SITE_URL}/${locale}${path}`;
      return acc;
    },
    { "x-default": `${SITE_URL}${path}` },
  );

  return {
    canonical: `${SITE_URL}${path}`,
    languages: languages as Record<string, string>,
  };
}

/**
 * Returns `alternates` compatible with Next.js `MetadataRoute.Sitemap` entries.
 * (Sitemap alternates only take `{ languages }`, not `{ canonical, languages }`.)
 */
export function buildSitemapAlternates(
  path: string,
): { languages: Record<string, string> } {
  const languages = LOCALES.reduce<Record<string, string>>(
    (acc, locale) => {
      acc[locale] = `${SITE_URL}/${locale}${path}`;
      return acc;
    },
    { "x-default": `${SITE_URL}${path}` },
  );
  return { languages };
}

/**
 * Factory that produces a fully-populated Next.js `Metadata` object.
 *
 * Automatically wires up:
 *  - Open Graph (title, description, image, url, siteName, type)
 *  - Twitter card (summary_large_image)
 *  - Canonical URL + hreflang alternates for every supported locale
 */
export function buildPageMetadata({
  title,
  description,
  path     = "",
  ogImage  = DEFAULT_OG_IMAGE,
  ogType   = "website",
  noIndex  = false,
}: BuildMetadataOptions): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url:      `${SITE_URL}${path}`,
      siteName: SITE_NAME,
      type:     ogType,
      images:   [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card:        "summary_large_image",
      site:        "@joinyourevent",
      title,
      description,
      images:      [ogImage],
    },
    alternates: buildLocaleAlternates(path),
    ...(noIndex && { robots: { index: false, follow: false } }),
  };
}
