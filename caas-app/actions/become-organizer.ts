"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function becomeOrganizerAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  const res = await fetch(
    `${process.env.MASTER_URL}/autho/user-management/become-organizer/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `CAAS ${token}` } : {}),
      },
    },
  );

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { success: false, error: data?.detail ?? "Something went wrong" };
  }

  revalidatePath("/");
  return { success: true };
}
