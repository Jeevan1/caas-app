import { MetadataRoute } from "next";
import { SITE_URL, LOCALES } from "@/lib/seo";

/** Private paths that must never be indexed */
const PRIVATE_PATHS = [
  "/dashboard/",
  "/profile/",
  "/settings/",
  "/login/",
  "/register/",
] as const;

/** Paths that are always off-limits regardless of locale */
const ALWAYS_PRIVATE = ["/api/", "/admin/"] as const;

/** Generate locale-prefixed disallow entries for every private path */
const localeDisallows = LOCALES.flatMap((locale) =>
  PRIVATE_PATHS.map((path) => `/${locale}${path}`),
);

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...ALWAYS_PRIVATE, ...PRIVATE_PATHS, ...localeDisallows],
      },
      // ── AI / scraper bots ────────────────────────────────────────────────
      { userAgent: "GPTBot",          disallow: "/" },
      { userAgent: "CCBot",           disallow: "/" },
      { userAgent: "anthropic-ai",    disallow: "/" },
      { userAgent: "Claude-Web",      disallow: "/" },
      { userAgent: "Google-Extended", disallow: "/" },
      { userAgent: "Bytespider",      disallow: "/" },
      { userAgent: "FacebookBot",     disallow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}