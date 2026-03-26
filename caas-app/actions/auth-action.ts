"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface LoginPayload {
  user_identifier: string;
  password: string;
}

interface LoginResult {
  success: false;
  error: string;
  fieldErrors?: Record<string, string>;
}

export async function loginAction(payload: LoginPayload): Promise<LoginResult> {
  const res = await fetch(`${process.env.MASTER_URL}/autho/create-token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Surface field-level errors (e.g. { user_identifier: ["Not found"] })
    const fieldErrors: Record<string, string> = {};
    for (const [key, val] of Object.entries(data)) {
      if (key !== "detail" && Array.isArray(val)) {
        fieldErrors[key] = val[0] as string;
      }
    }

    return {
      success: false,
      error:
        data?.detail ?? data?.non_field_errors?.[0] ?? "Invalid credentials",
      ...(Object.keys(fieldErrors).length ? { fieldErrors } : {}),
    };
  }

  // Set tokens as httpOnly cookies server-side
  // (only needed if your API returns tokens in the body instead of Set-Cookie)
  if (data.access) {
    const cookieStore = await cookies();
    cookieStore.set("accessToken", data.access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });
  }
  if (data.refresh) {
    const cookieStore = await cookies();
    cookieStore.set("refreshToken", data.refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }

  // Invalidate ALL cached RSC payloads so dashboard fetches fresh data
  revalidatePath("/", "layout");

  redirect("/dashboard");
}
