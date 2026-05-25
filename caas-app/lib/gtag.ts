export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

export function gtagEvent(
  action: string,
  params?: Record<string, unknown>,
) {
  if (typeof window === "undefined" || !GA_TRACKING_ID) return;

  if (typeof (window as any).gtag === "function") {
    (window as any).gtag("event", action, params);
  }
}

// ─── Event-specific tracking ──────────────────────────────────────────────────

export function trackEventClick(eventId: string, eventTitle: string) {
  gtagEvent("view_item", {
    item_id: eventId,
    item_name: eventTitle,
    item_category: "event",
  });
}

export function trackJoinEvent(eventId: string, eventTitle: string, isPaid: boolean) {
  gtagEvent("add_to_cart", {
    currency: "NPR",
    value: isPaid ? undefined : 0,
    items: [{ item_id: eventId, item_name: eventTitle }],
  });
}

export function trackSearch(query: string) {
  gtagEvent("search", { search_term: query });
}

export function trackFilter(filterName: string, filterValue: string) {
  gtagEvent("filter", { filter_name: filterName, filter_value: filterValue });
}
