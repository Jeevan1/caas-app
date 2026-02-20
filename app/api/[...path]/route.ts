import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE = process.env.MASTER_URL!;
const MHR_BASE = process.env.MASTER_URL!;

async function proxy(req: NextRequest) {
  const token = (await cookies()).get("accessToken")?.value;

  const host = req.headers.get("host")!;

  const rawPath = req.nextUrl.pathname.replace(/^\/api\/?/, "");
  const path = rawPath.replace(/^\/|\/$/g, "");
  const headers: HeadersInit = {};
  if (token) headers["Authorization"] = `HOS ${token}`;

  const contentType = req.headers.get("content-type");
  if (contentType && !contentType.includes("multipart/form-data")) {
    headers["Content-Type"] = contentType;
  }

  let body: BodyInit | undefined = undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    if (contentType?.includes("multipart/form-data")) {
      body = await req.formData();
    } else if (contentType?.includes("application/json")) {
      body = JSON.stringify(await req.json());
    } else {
      body = await req.text();
    }
  }

  try {
    const getBackendBase = await fetch(`${API_BASE}/config/domains-map/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `HOS ${token}`,
      },
      cache: "force-cache",
    });

    const backendBaseData = await getBackendBase.json();

    if (!backendBaseData) {
      return NextResponse.error();
    }

    let backendBase = backendBaseData[host] || MHR_BASE;

    backendBase.startsWith("http")
      ? (backendBase = backendBase)
      : (backendBase = `https://${backendBase}`);

    let pathname = `/${path}`;
    if (req.method !== "GET") pathname += "/";

    const url = new URL(backendBase);

    const base = url.toString().replace(/\/$/, "");

    const backendUrl = `${API_BASE}${pathname}${req.nextUrl.search}`;

    const res = await fetch(backendUrl, {
      method: req.method,
      headers,
      body,
    });

    if (res.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    let data: any = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    const response = NextResponse.json(data, { status: res.status });

    if (path === "auth/create-token" && data) {
      const access = data.access || data.token?.access;
      const refresh = data.refresh || data.token?.refresh;
      const isProd = process.env.NODE_ENV === "production";

      const cookieOptions = {
        httpOnly: true,
        secure: isProd,
        sameSite: "strict" as const,
        path: "/",
      };

      if (access) response.cookies.set("accessToken", access, cookieOptions);
      if (refresh) response.cookies.set("refreshToken", refresh, cookieOptions);
    }

    return response;
  } catch (err: any) {
    console.error("Proxy error:", err);
    return new NextResponse(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
