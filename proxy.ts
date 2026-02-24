// proxy.ts
import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, NextRequest } from "next/server";
import { ROUTE_CONFIGS, RouteAccess, RouteConfig } from "@/config/routes";
import { locales, defaultLocale, localePrefix, Locale } from "@/i18n/config";

// ─── i18n ─────────────────────────────────────────────────────────────────────

function getLocale(req: NextRequest): Locale {
  const segment = req.nextUrl.pathname.split("/")[1] as Locale;
  if (locales.includes(segment)) return segment;

  const cookie = req.cookies.get("locale")?.value as Locale;
  if (cookie && locales.includes(cookie)) return cookie;

  const browser = (req.headers.get("accept-language") ?? "")
    .split(",")[0]
    .split("-")[0]
    .trim() as Locale;
  if (locales.includes(browser)) return browser;

  return defaultLocale;
}

/** /np/account/orders → /account/orders */
function stripLocale(pathname: string): string {
  const segment = pathname.split("/")[1];
  if (locales.includes(segment as Locale)) {
    return "/" + pathname.split("/").slice(2).join("/") || "/";
  }
  return pathname;
}

// ─── Match ────────────────────────────────────────────────────────────────────

function matchRoute(stripped: string): RouteConfig | null {
  const matched = ROUTE_CONFIGS.filter(
    ({ pattern }) => stripped === pattern || stripped.startsWith(`${pattern}/`),
  );
  if (!matched.length) return null;
  return matched.reduce((best, cur) =>
    cur.pattern.length > best.pattern.length ? cur : best,
  );
}

// ─── Session ──────────────────────────────────────────────────────────────────

interface Session {
  isLoggedIn: boolean;
  role: string | null;
}

function getSession(req: NextRequest): Session {
  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;
  const role = req.cookies.get("role")?.value ?? null;
  return {
    isLoggedIn: Boolean(accessToken || refreshToken),
    role,
  };
}

// ─── Redirects ────────────────────────────────────────────────────────────────

function toLogin(req: NextRequest, locale: Locale): NextResponse {
  const { pathname, search } = req.nextUrl;
  const url = new URL(`/${locale}/login`, req.url);
  const next = `${pathname}${search}`;
  if (next !== "/") url.searchParams.set("next", next);
  return NextResponse.redirect(url);
}

function toPath(req: NextRequest, path: string): NextResponse {
  return NextResponse.redirect(new URL(path, req.url));
}

// ─── Access Handlers ──────────────────────────────────────────────────────────

const handlers: Record<
  RouteAccess,
  (
    req: NextRequest,
    config: RouteConfig,
    session: Session,
    locale: Locale,
  ) => NextResponse | null
> = {
  public: () => null,

  auth: (req, _config, session, locale) => {
    if (!session.isLoggedIn) return toLogin(req, locale);
    return null;
  },

  admin: (req, _config, session, locale) => {
    if (!session.isLoggedIn) return toLogin(req, locale);
    if (session.role !== "admin") return toPath(req, `/${locale}`);
    return null;
  },

  "guest-only": (req, config, session, locale) => {
    if (session.isLoggedIn) {
      // const next = req.nextUrl.searchParams.get("next");

      // // NEVER redirect to login again
      // if (req.nextUrl.pathname.endsWith("/login")) {
      //   return toPath(req, `/${locale}`);
      // }

      // return toPath(req, next || config.redirectTo || `/${locale}`);
      return null;
    }
    return null;
  },
};

// ─── Proxy ────────────────────────────────────────────────────────────────────

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const locale = getLocale(req);
  const stripped = stripLocale(pathname);
  const route = matchRoute(stripped);

  // 1. Auth guard first
  if (route) {
    const session = getSession(req);
    const redirect = handlers[route.access](req, route, session, locale);

    if (redirect) return redirect;
  }

  // 2. i18n routing
  const handleI18n = createIntlMiddleware({
    locales,
    defaultLocale, // ✅ always "en" — never dynamic
    localePrefix,
    localeDetection: true,
  });

  const response = handleI18n(req);

  // 3. Persist locale cookie
  response.cookies.set("locale", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
