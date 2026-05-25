import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, NextRequest } from "next/server";
import { ROUTE_CONFIGS, RouteAccess, RouteConfig } from "@/config/routes";
import { locales, defaultLocale, localePrefix, Locale } from "@/i18n/config";

const SITE_URL = "https://joinyourevent.com";

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

  "guest-only": (req, _config, session, locale) => {
  if (session.isLoggedIn) return toPath(req, `/${locale}`);
  return null;
},
};

// ─── SEO helpers ──────────────────────────────────────────────────────────────

function enforceNonWww(req: NextRequest): NextResponse | null {
  const host = req.headers.get("host") ?? "";
  if (host.startsWith("www.")) {
    const url = req.nextUrl.clone();
    url.host = host.replace("www.", "");
    url.protocol = "https";
    return NextResponse.redirect(url, { status: 301 });
  }
  return null;
}

function enforceTrailingSlash(req: NextRequest): NextResponse | null {
  const { pathname } = req.nextUrl;

  if (
    pathname === "/" ||
    pathname.length < 2 ||
    pathname.endsWith("/") ||
    pathname.includes(".")
  ) {
    return null;
  }

  const url = req.nextUrl.clone();
  url.pathname = `${pathname}/`;
  return NextResponse.redirect(url, { status: 301 });
}

function addSecurityHeaders(response: NextResponse): void {
  const headers = response.headers;

  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "SAMEORIGIN");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  );
  headers.set(
  "Strict-Transport-Security",
  "max-age=63072000; includeSubDomains; preload"
);
}

// ─── Proxy ────────────────────────────────────────────────────────────────────

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. SEO: www → non-www redirect
  const wwwRedirect = enforceNonWww(req);
  if (wwwRedirect) return wwwRedirect;

  // 2. SEO: trailing slash enforcement (skip for API and files)
  if (!pathname.startsWith("/api/") && !pathname.includes(".")) {
    const slashRedirect = enforceTrailingSlash(req);
    if (slashRedirect) return slashRedirect;
  }

  // 3. Auth guard
  const locale = getLocale(req);
  const stripped = stripLocale(pathname);
  const route = matchRoute(stripped);

  if (route) {
    const session = getSession(req);
    const redirect = handlers[route.access](req, route, session, locale);
    if (redirect) return redirect;
  }

  // 4. i18n routing
  const handleI18n = createIntlMiddleware({
    locales,
    defaultLocale,
    localePrefix,
    localeDetection: true,
  });

  const response = handleI18n(req);

  // 5. Persist locale cookie
  response.cookies.set("locale", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: true, 
  });

  // 6. Security headers
  addSecurityHeaders(response);

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
