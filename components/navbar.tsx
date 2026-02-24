"use client";

import { useState } from "react";
import { Menu, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggler";
import { LanguageSwitcher } from "./local-switcher";
import { Link, usePathname } from "@/i18n/navigation"; // ✅ next-intl
import { useTranslations } from "next-intl";
import AuthPopup from "./auth/AuthModel";
import { useCurrentUser } from "@/lib/providers";
import UserMenu from "./UserMenu";
import { toast, useToast } from "@/hooks/use-toast";
import { showToast } from "./toast";
type CommonKeys = Parameters<ReturnType<typeof useTranslations<"common">>>[0];

const navLinks: { href: string; labelKey: CommonKeys }[] = [
  { href: "/", labelKey: "nav.home" },
  { href: "/about", labelKey: "nav.about" },
  { href: "/how-it-works", labelKey: "nav.howItWorks" },
  { href: "/templates", labelKey: "nav.templates" },
  { href: "/pricing", labelKey: "nav.pricing" },
  { href: "/blog", labelKey: "nav.blog" },
  { href: "/contact", labelKey: "nav.contact" },
];
export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("common");
  const user = useCurrentUser();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <nav className="mx-auto flex container items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            {t("nav.contact")}
          </span>
        </Link>

        <LanguageSwitcher />

        {/* Desktop Nav */}
        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground ${
                  pathname === link.href
                    ? "bg-muted text-foreground" // ✅ active state
                    : "text-muted-foreground"
                }`}
              >
                {t(link.labelKey)}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {user ? <UserMenu user={user} /> : <AuthPopup />}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-md p-2 text-foreground md:hidden"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-card px-6 pb-6 pt-2 md:hidden">
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground ${
                    pathname === link.href
                      ? "bg-muted text-foreground" // ✅ active state
                      : "text-muted-foreground"
                  }`}
                >
                  {t(link.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col gap-2">
            {user ? (
              <UserMenu user={user} />
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full">
                    {t("auth.login")}
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
