import { cookies, headers } from "next/headers";

interface ApiFetchOptions extends RequestInit {
  tags?: string[];
}

const API_BASE = process.env.MASTER_URL!;

export async function serverFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  let pathname = path.startsWith("/") ? path : `/${path}`;

  if (options.method && options.method !== "GET") {
    pathname += "/";
  }

  const finalUrl = `${API_BASE}${pathname}`;

  try {
    const res = await fetch(finalUrl, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: token ? `CAAS ${token}` : "",
        "Content-Type": "application/json",
      },
      next: { tags: options.tags ?? [] },
    });

    if (!res.ok) {
      console.error("API Error:", res.status, res.statusText, finalUrl);
      return null;
    }

    return (await res.json()) as T;
  } catch (error) {
    console.error("Server fetch error:", error);
    return null;
  }
}
