"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, localeConfig, Locale } from "@/i18n/config";
import { setLocaleCookie } from "@/i18n/utils";

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function switchLocale(next: Locale) {
    if (next === locale) return;
    setLocaleCookie(next);
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <div className="flex items-center gap-1">
      {locales.map((l) => (
        <button
          key={l}
          onClick={() => switchLocale(l)}
          disabled={pending}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${
            l === locale
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>{localeConfig[l].flag}</span>
          <span>{localeConfig[l].name}</span>
        </button>
      ))}
    </div>
  );
}
