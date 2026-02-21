import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { locales, defaultLocale, Locale } from "./config";

async function loadMessages(locale: Locale) {
  try {
    const common = (await import(`../messages/${locale}/common.json`)).default;
    return { common }; // ✅ wrap under "common" key
  } catch {
    const common = (await import(`../messages/en/common.json`)).default;
    return { common }; // ✅ fallback also wrapped
  }
}

function resolveLocale(
  cookieLocale: string | undefined,
  acceptLanguage: string,
): Locale {
  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale;
  }
  const browser = acceptLanguage.split(",")[0].split("-")[0].trim();
  if (locales.includes(browser as Locale)) return browser as Locale;
  return defaultLocale;
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = (await requestLocale) as Locale;

  if (!locale || !locales.includes(locale)) {
    const cookieStore = await cookies();
    const headerStore = await headers();
    locale = resolveLocale(
      cookieStore.get("locale")?.value,
      headerStore.get("accept-language") ?? "",
    );
  }

  return {
    locale,
    messages: await loadMessages(locale),
  };
});
