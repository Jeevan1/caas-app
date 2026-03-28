import "server-only";

import { cookies } from "next/headers";
import { CurrentUserSettings } from "../types";

const BASE_URL = process.env.MASTER_URL!;

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export async function fetchUserSettings<TSetting = unknown>(
  accessToken: string,
): Promise<TSetting> {
  const response = await fetch(`${BASE_URL}/autho/user-settings/me`, {
    headers: {
      Authorization: `CAAS ${accessToken}`,
    },
    cache: "no-store",
  });
  if (response.status === 401 || response.status === 403) {
    throw new UnauthorizedError();
  }

  if (!response.ok) {
    console.error("API Error:", response.status, response.statusText);
    return null as TSetting;
  }

  return response.json();
}

export async function getCurrentUserSettings(): Promise<CurrentUserSettings | null> {
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) {
    return null;
  }

  try {
    return await fetchUserSettings<CurrentUserSettings>(accessToken);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return null;
    }

    throw error;
  }
}
