import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { NextIntlClientProvider, hasLocale } from "next-intl";

import "../globals.css";
import { CurrentUserProvider, Providers } from "@/lib/providers";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { Locale, localeConfig, locales } from "@/i18n/config";
import { getMessages } from "next-intl/server";

const _inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});
const _spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "CaaS - Consumer as a Service",
  description:
    "Promote, Grow, and Track Your Business Easily. Affordable DIY marketing tools for small businesses, event organizers, and entrepreneurs.",
  generator: "v0.app",
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
};

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
            <CurrentUserProvider user={user}>{children}</CurrentUserProvider>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
