import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { cleanImageUrl } from "@/lib/helpers";

const API_BASE = process.env.MASTER_URL!;
const isProd = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "strict" as const,
  path: "/",
};

function setAuthCookies(res: NextResponse, access: string, refresh: string) {
  res.cookies.set("accessToken", access, { ...cookieOptions, maxAge: 60 * 60 });
  res.cookies.set("refreshToken", refresh, {
    ...cookieOptions,
    maxAge: 60 * 60 * 24 * 7,
  });
}

// ── Google Social Auth ────────────────────────────────────────────────────────
async function handleGoogleSocialAuth(req: NextRequest): Promise<NextResponse> {
  try {
    const { auth_token } = await req.json();

    if (!auth_token) {
      return NextResponse.json(
        { error: "Missing auth_token" },
        { status: 400 },
      );
    }

    const res = await fetch(`${API_BASE}/social-auth/google/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ auth_token }),
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err?.detail ?? "Google sign-in failed." },
        { status: res.status },
      );
    }
    const data = await res.json();
    // data = { user: { idx, name, email, ... }, tokens: { access, refresh } }
    console.log("Google social auth:", data);

    const response = NextResponse.json({
      is_new: !data.user?.is_email_verified && !data.user?.phone, // or however you detect new user
      email: data.user?.email ?? "",
      name: data.user?.name ?? "",
      image: cleanImageUrl(data.user?.image),
    });

    setAuthCookies(response, data.tokens.access, data.tokens.refresh);
    return response;
  } catch {
    return NextResponse.json({ error: "Network error." }, { status: 500 });
  }
}

// ── Generic Proxy ─────────────────────────────────────────────────────────────
async function proxy(req: NextRequest) {
  const rawPath = req.nextUrl.pathname.replace(/^\/api\/?/, "");
  const path = rawPath.replace(/^\/|\/$/g, "");

  // ── Intercept Google social auth ──────────────────────────────────────────
  if (path === "social-auth/google" && req.method === "POST")
    return handleGoogleSocialAuth(req);

  const token = (await cookies()).get("accessToken")?.value;
  const headers: HeadersInit = {};
  if (token) headers["Authorization"] = `CAAS ${token}`;

  const contentType = req.headers.get("content-type");
  if (contentType && !contentType.includes("multipart/form-data")) {
    headers["Content-Type"] = contentType;
  }

  let body: BodyInit | undefined = undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    if (contentType?.includes("multipart/form-data"))
      body = await req.formData();
    else if (contentType?.includes("application/json"))
      body = JSON.stringify(await req.json());
    else body = await req.text();
  }

  let pathname = `/${path}`;
  if (req.method !== "GET") pathname += "/";

  const backendUrl = `${API_BASE}${pathname}${req.nextUrl.search}`;
  const res = await fetch(backendUrl, { method: req.method, headers, body });

  if (res.status === 204) return new NextResponse(null, { status: 204 });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  const response = NextResponse.json(data, { status: res.status });

  // Standard login cookies
  if (path === "autho/create-token" && data) {
    const access = data.access || data.token?.access;
    const refresh = data.refresh || data.token?.refresh;
    if (access && refresh) setAuthCookies(response, access, refresh);
  }

  return response;
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
