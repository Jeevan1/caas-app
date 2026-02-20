import "server-only";

import { cookies } from "next/headers";
import { User } from "../types";

const BASE_URL = process.env.MASTER_URL ?? "http://localhost:7000";

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export async function fetchUserProfile<TProfile = unknown>(
  accessToken: string,
): Promise<TProfile> {
  const response = await fetch(`${BASE_URL}/auth/users/me/`, {
    headers: {
      Authorization: `HOS ${accessToken}`,
    },
    cache: "no-store",
  });
  if (response.status === 401 || response.status === 403) {
    throw new UnauthorizedError();
  }

  if (!response.ok) {
    throw new Error(`Failed to load current user: ${response.statusText}`);
  }

  return response.json();
}

export async function getCurrentUser(): Promise<User | null> {
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) {
    return {
      id: "Jane Doe",
      name: "Jane Doe",
      email: "kDd7O@example.com",
      image: "",
    };
  }

  try {
    return await fetchUserProfile<User>(accessToken);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return null;
    }

    throw error;
  }
}
