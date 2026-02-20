// middleware.ts
import { NextResponse, NextRequest } from "next/server";
import { ROUTE_CONFIGS, RouteAccess, RouteConfig } from "@/config/routes";

// ─── Match ────────────────────────────────────────────────────────────────────

/**
 * Find the MOST SPECIFIC matching route config for a given pathname.
 * Longer pattern = more specific (e.g. /account/orders beats /account).
 */
function matchRoute(pathname: string): RouteConfig | null {
  const matched = ROUTE_CONFIGS.filter(
    ({ pattern }) => pathname === pattern || pathname.startsWith(`${pattern}/`),
  );

  if (matched.length === 0) return null;

  // Most specific match wins
  return matched.reduce((best, current) =>
    current.pattern.length > best.pattern.length ? current : best,
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

function toLogin(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const url = new URL("/login", req.url);
  const next = `${pathname}${search}`;
  if (next !== "/") url.searchParams.set("next", next);
  return NextResponse.redirect(url);
}

function toPath(req: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, req.url));
}

// ─── Access Handlers ──────────────────────────────────────────────────────────

const handlers: Record<
  RouteAccess,
  (
    req: NextRequest,
    config: RouteConfig,
    session: Session,
  ) => NextResponse | null
> = {
  // Anyone can access
  public: () => null,

  // Must be logged in
  auth: (req, _config, session) => {
    if (!session.isLoggedIn) return toLogin(req);
    return null;
  },

  // Must be logged in AND have admin role
  admin: (req, _config, session) => {
    if (!session.isLoggedIn) return toLogin(req);
    if (session.role !== "admin") return toPath(req, "/");
    return null;
  },

  // Only for guests — logged-in users are redirected away
  "guest-only": (req, config, session) => {
    if (session.isLoggedIn) {
      const next = req.nextUrl.searchParams.get("next");
      return toPath(req, next || config.redirectTo || "/account");
    }
    return null;
  },
};

// ─── Middleware ───────────────────────────────────────────────────────────────

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const route = matchRoute(pathname);

  // No config match → treat as public (or change to "auth" for private-by-default)
  if (!route) return NextResponse.next();

  const session = getSession(req);
  const redirect = handlers[route.access](req, route, session);

  return redirect ?? NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
