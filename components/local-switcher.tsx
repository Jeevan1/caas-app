"use client";

import { useTransition, useState, useRef, useEffect } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, localeConfig, Locale } from "@/i18n/config";
import { setLocaleCookie } from "@/i18n/utils";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function switchLocale(next: Locale) {
    if (next === locale) {
      setOpen(false);
      return;
    }
    setLocaleCookie(next);
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
    setOpen(false);
  }

  const current = localeConfig[locale];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={pending}
        className={cn(
          "flex h-9 items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 text-sm font-medium transition-all duration-150 disabled:opacity-50",
          "hover:bg-muted hover:border-border/80",
          open && "bg-muted border-primary/30 ring-2 ring-primary/10",
        )}
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="text-foreground">{current.name}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-1.5 min-w-[140px] overflow-hidden rounded-xl border border-border bg-card shadow-lg shadow-black/5 ring-1 ring-inset ring-white/[0.06]"
          style={{ animation: "dropIn 0.15s ease both" }}
        >
          {locales.map((l) => {
            const config = localeConfig[l];
            const isActive = l === locale;
            return (
              <button
                key={l}
                onClick={() => switchLocale(l)}
                disabled={pending}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors disabled:opacity-50",
                  isActive
                    ? "bg-primary/5 text-primary font-semibold"
                    : "text-foreground hover:bg-muted",
                )}
              >
                <span className="text-base leading-none">{config.flag}</span>
                <span className="flex-1 text-left">{config.name}</span>
                {isActive && (
                  <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                )}
              </button>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
    </div>
  );
}
