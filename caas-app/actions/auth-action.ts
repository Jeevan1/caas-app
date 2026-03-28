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

  const cookieStore = await cookies();

  if (data.access) {
    cookieStore.set("accessToken", data.access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
  }
  if (data.refresh) {
    cookieStore.set("refreshToken", data.refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
