export const locales = ["en", "np"] as const;
export const defaultLocale = "en" as const;

export type Locale = (typeof locales)[number];
export const localePrefix = "as-needed" as const;

export const localeConfig: Record<
  Locale,
  { name: string; flag: string; dir: "ltr" | "rtl" }
> = {
  en: { name: "English", flag: "🇺🇸", dir: "ltr" },
  np: { name: "नेपाली", flag: "🇳🇵", dir: "ltr" },
};
