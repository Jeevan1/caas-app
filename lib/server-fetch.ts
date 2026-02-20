import { cookies, headers } from "next/headers";

interface ApiFetchOptions extends RequestInit {
  tags?: string[];
}

const API_BASE = process.env.MASTER_URL!;
const MHR_BASE = process.env.MASTER_URL!;

export async function serverFetch(path: string, options: ApiFetchOptions = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  const headerList = await headers();
  const host = headerList.get("host");

  if (!host) {
    throw new Error("Host header not found");
  }

  const domainRes = await fetch(`${API_BASE}/config/domains-map/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `HOS ${token}` : "",
    },
    cache: "force-cache",
  });

  if (!domainRes.ok) {
    throw new Error("Failed to load domains map");
  }

  const domainMap = await domainRes.json();

  let backendBase: string = domainMap[host] || MHR_BASE;

  if (!backendBase.startsWith("http")) {
    backendBase = `https://${backendBase}`;
  }

  const url = new URL(backendBase);
  const base = url.toString().replace(/\/$/, "");

  let pathname = path.startsWith("/") ? path : `/${path}`;

  if (options.method && options.method !== "GET") {
    pathname += "/";
  }

  const finalUrl = `${base}${pathname}`;

  const res = await fetch(finalUrl, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: token ? `HOS ${token}` : "",
      "Content-Type": "application/json",
    },
    next: { tags: options.tags ?? [] },
  });

  if (!res.ok) {
    return res.json();
  }

  return res.json();
}
