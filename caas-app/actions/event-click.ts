"use server";

import { serverFetch } from "@/lib/server-fetch";

export async function trackEventClick(idx: string) {
  await serverFetch(`/event/events/${idx}/click/`, {
    method: "POST",
  });
}
