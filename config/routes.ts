// config/routes.ts  ← single source of truth
export type RouteAccess = "public" | "auth" | "admin" | "guest-only";

export interface RouteConfig {
  pattern: string;
  access: RouteAccess;
  redirectTo?: string; // override default redirect
}

export const ROUTE_CONFIGS: RouteConfig[] = [
  // ── Static / Infrastructure ──────────────────────────────
  { pattern: "/_next", access: "public" },
  { pattern: "/api/auth", access: "public" },
  { pattern: "/favicon.ico", access: "public" },
  { pattern: "/assets", access: "public" },
  { pattern: "/images", access: "public" },

  // ── Marketing / Content ──────────────────────────────────
  { pattern: "/", access: "public" },
  { pattern: "/about", access: "public" },
  { pattern: "/contact", access: "public" },
  { pattern: "/blog", access: "public" },
  { pattern: "/faq", access: "public" },

  // ── Shop (browsing is public) ─────────────────────────────
  { pattern: "/products", access: "public" },
  { pattern: "/categories", access: "public" },
  { pattern: "/search", access: "public" },
  { pattern: "/deals", access: "public" },

  // ── Auth Pages (logged-in users bounce out) ───────────────
  { pattern: "/login", access: "guest-only", redirectTo: "/account" },
  { pattern: "/register", access: "guest-only", redirectTo: "/account" },
  { pattern: "/forgot-password", access: "guest-only", redirectTo: "/account" },
  { pattern: "/reset-password", access: "guest-only", redirectTo: "/account" },

  // ── Requires Login ────────────────────────────────────────
  { pattern: "/account", access: "auth" },
  { pattern: "/dashboard", access: "auth" },
  { pattern: "/orders", access: "auth" },
  { pattern: "/checkout", access: "auth" },
  { pattern: "/wishlist", access: "auth" },
  { pattern: "/reviews", access: "auth" },
  { pattern: "/cart", access: "auth" },
  { pattern: "/notifications", access: "auth" },

  // ── Requires Admin ────────────────────────────────────────
  { pattern: "/admin", access: "admin" },
  { pattern: "/dashboard", access: "admin" },
  { pattern: "/reports", access: "admin" },
];
