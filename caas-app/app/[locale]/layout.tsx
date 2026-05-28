import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { NextIntlClientProvider } from "next-intl";
import Script from "next/script";
import "../globals.css";
import {
  CurrentUserProvider,
  CurrentUserSettingsProvider,
  Providers,
} from "@/lib/providers";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { Locale, localeConfig, locales } from "@/i18n/config";
import { getMessages } from "next-intl/server";
import { getCurrentUserSettings } from "@/lib/auth/get-current-user-settings";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/JsonLd";
import {
  SITE_URL,
  SITE_NAME,
  DEFAULT_OG_IMAGE,
  OG_LOCALE_MAP,
  LOCALES,
} from "@/lib/seo";

// ─── Fonts ───────────────────────────────────────────────────────────────────
// font-sans → Inter  |  font-heading → Space Grotesk
const _inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const _spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

// ─── Metadata ────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params: paramsPromise,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await paramsPromise;
  const canonicalRoot =
    locale === "en" ? SITE_URL : `${SITE_URL}/${locale}`;

  return {
    title: {
      default:  SITE_NAME,
      template: `%s | ${SITE_NAME}`,
    },
    description:
      "Discover and join events happening near you in Nepal. Browse concerts, workshops, festivals and more on Join Your Event.",
    metadataBase: new URL(SITE_URL),
    keywords: [
      "events",
      "kathmandu",
      "nepal",
      "event organizer",
      "community events",
      "local events",
      "event discovery",
    ],
    authors:  [{ name: SITE_NAME }],
    creator:  SITE_NAME,
    openGraph: {
      siteName: SITE_NAME,
      type:     "website",
      locale:   OG_LOCALE_MAP[locale as keyof typeof OG_LOCALE_MAP] ?? "en_US",
      images:   [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      site: "@joinyourevent",
    },
    robots: {
      index:  true,
      follow: true,
      googleBot: {
        index:               true,
        follow:              true,
        "max-image-preview": "large",
        "max-snippet":       -1,
      },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "",
    },
    alternates: {
      canonical: canonicalRoot,
      languages: {
        ...LOCALES.reduce<Record<string, string>>((acc, l) => {
          acc[l] = `${SITE_URL}/${l}`;
          return acc;
        }, {}),
        "x-default": SITE_URL,
      } as Record<string, string>,
    },
  };
}

export const viewport: Viewport = { themeColor: "#2563eb" };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// ─── Root layout ─────────────────────────────────────────────────────────────
export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!locales.includes(rawLocale as Locale)) notFound();
  const locale = rawLocale as Locale;

  const messages = await getMessages();
  const dir      = localeConfig[locale as Locale].dir;
  const user     = await getCurrentUser();
  const settings = await getCurrentUserSettings();
  const masterUrl = process.env.MASTER_URL;

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${_inter.variable} ${_spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href={masterUrl} />
        <link rel="dns-prefetch" href={masterUrl} />
        {GA_ID && (
          <>
            <link rel="preconnect" href="https://www.googletagmanager.com" />
            <link rel="preconnect" href="https://www.google-analytics.com" />
          </>
        )}
        <OrganizationJsonLd />
        <WebSiteJsonLd />
      </head>
      <body className="font-sans antialiased">
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { page_path: window.location.pathname });
              `}
            </Script>
          </>
        )}

        <NextTopLoader color="#2563eb" showSpinner={false} />
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Providers>
            <CurrentUserProvider user={user}>
              <CurrentUserSettingsProvider settings={settings ?? null}>
                {children}
              </CurrentUserSettingsProvider>
            </CurrentUserProvider>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
