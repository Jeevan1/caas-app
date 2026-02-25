"use client";

import { useState, useEffect } from "react";
import { Menu, X, Zap } from "lucide-react";
import { ThemeToggle } from "./theme-toggler";
import { LanguageSwitcher } from "./local-switcher";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import AuthPopup from "./auth/AuthModel";
import { useCurrentUser } from "@/lib/providers";
import UserMenu from "./UserMenu";

type CommonKeys = Parameters<ReturnType<typeof useTranslations<"common">>>[0];

const navLinks: { href: string; labelKey: CommonKeys }[] = [
  { href: "/", labelKey: "nav.home" },
  { href: "/about", labelKey: "nav.about" },
  { href: "/events", labelKey: "nav.events" },
  { href: "/category", labelKey: "nav.categories" },
  { href: "/how-it-works", labelKey: "nav.howItWorks" },
  { href: "/templates", labelKey: "nav.templates" },
  { href: "/pricing", labelKey: "nav.pricing" },
  { href: "/blog", labelKey: "nav.blog" },
  { href: "/contact", labelKey: "nav.contact" },
];

export function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("common");
  const user = useCurrentUser();

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <nav className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              CaaS
            </span>
          </Link>

          <ul className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground ${
                    pathname === link.href
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {t(link.labelKey)}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-3 md:flex">
            <LanguageSwitcher />
            <ThemeToggle />
            {user ? <UserMenu user={user} /> : <AuthPopup />}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setDrawerOpen((o) => !o)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-muted"
              aria-label={drawerOpen ? "Close menu" : "Open menu"}
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </nav>
      </header>

      {drawerOpen && (
        <div
          className="fixed inset-0 z-[60] md:hidden"
          onClick={() => setDrawerOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          <div
            className="absolute inset-y-0 right-0 flex w-72 flex-col border-l border-border bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: "slideInRight 0.22s cubic-bezier(0.32,0.72,0,1) both",
            }}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <Link
                href="/"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-2"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Zap className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-base font-bold text-foreground">
                  CaaS
                </span>
              </Link>
              <button
                onClick={() => setDrawerOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-4">
              <ul className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setDrawerOpen(false)}
                      className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        pathname === link.href
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {t(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="border-t border-border p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <LanguageSwitcher />
              </div>
              {user ? (
                <UserMenu user={user} />
              ) : (
                <div className="flex flex-col gap-2">
                  <AuthPopup />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0.6; }
          to   { transform: translateX(0);    opacity: 1;   }
        }
      `}</style>
    </>
  );
}
