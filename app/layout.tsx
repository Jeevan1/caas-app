import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import NextTopLoader from "nextjs-toploader";

import "./globals.css";
import { CurrentUserProvider, Providers } from "@/lib/providers";
import { getCurrentUser } from "@/lib/auth/get-current-user";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html
      lang="en"
      className={`${_inter.variable} ${_spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <NextTopLoader color="#2563eb" showSpinner={false} />
        <Providers>
          <CurrentUserProvider user={user}>{children}</CurrentUserProvider>
        </Providers>
      </body>
    </html>
  );
}
