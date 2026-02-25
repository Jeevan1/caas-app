"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, localeConfig, Locale } from "@/i18n/config";
import { setLocaleCookie } from "@/i18n/utils";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const current = localeConfig[locale];

  function switchLocale(next: Locale) {
    if (next === locale) return;
    setLocaleCookie(next);
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          disabled={pending}
          className={cn(
            "flex h-9 items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 text-sm font-medium outline-none transition-all duration-150 disabled:opacity-50",
            "hover:bg-muted hover:border-border/80",
            "data-[state=open]:bg-muted data-[state=open]:border-primary/30 data-[state=open]:ring-2 data-[state=open]:ring-primary/10",
          )}
        >
          <span className="text-base leading-none">{current.flag}</span>
          <span className="hidden text-foreground sm:inline">
            {current.name}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="z-[9999] min-w-[140px] overflow-hidden rounded-xl border border-border bg-card p-0 shadow-lg shadow-black/5 ring-1 ring-inset ring-white/[0.06]"
      >
        {locales.map((l) => {
          const config = localeConfig[l];
          const isActive = l === locale;
          return (
            <DropdownMenuItem
              key={l}
              disabled={pending}
              onSelect={() => switchLocale(l)}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 rounded-none px-3.5 py-2.5 text-sm focus:bg-muted",
                isActive
                  ? "bg-primary/5 font-semibold text-primary focus:bg-primary/10"
                  : "text-foreground",
              )}
            >
              <span className="text-base leading-none">{config.flag}</span>
              <span className="flex-1">{config.name}</span>
              {isActive && (
                <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
