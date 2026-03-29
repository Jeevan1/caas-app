import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { NextIntlClientProvider } from "next-intl";
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

const _inter = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-inter",
});
const _spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: {
    default: "Join Your Event",
    template: "%s | Join Your Event",
  },
  description:
    "Promote, Grow, and Track Your Business Easily. Affordable DIY marketing tools for small businesses, event organizers, and entrepreneurs.",
  metadataBase: new URL("https://joinyourevent.com"),
  keywords: ["events", "kathmandu", "nepal", "event organizer"],
  authors: [{ name: "Join Your Event" }],
  creator: "Join Your Event",
  openGraph: {
    siteName: "Join Your Event",
    type: "website",
    images: [{ url: "/og-default.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", site: "@joinyourevent" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export const viewport: Viewport = { themeColor: "#2563eb" };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();

  const messages = await getMessages();
  const dir = localeConfig[locale as Locale].dir;
  const user = await getCurrentUser();
  const settings = await getCurrentUserSettings();

  // const needsPhone = !!user && !user.phone;

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${_inter.variable} ${_spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <NextTopLoader color="#2563eb" showSpinner={false} />
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Providers>
            <CurrentUserProvider user={user}>
              <CurrentUserSettingsProvider settings={settings ?? null}>
                {children}

                {/* {needsPhone && (
                <PhoneNumberGate userName={user.name ?? undefined} />
              )} */}
              </CurrentUserSettingsProvider>
            </CurrentUserProvider>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
