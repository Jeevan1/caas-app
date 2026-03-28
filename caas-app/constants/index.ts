export const EVENTS_QUERY_KEY = ["events"];
export const EVENT_DETAILS_QUERY_KEY = (id: string) => ["events", id];
export const FOLLOW_QUERY_KEY = ["follow"];
export const UNFOLLOW_QUERY_KEY = ["unfollow"];
export const SINGLE_EVENT_QUERY_KEY = (id: string) => ["event", id];
export const EVENTS_BY_CATEGORY_QUERY_KEY = (id: string) => ["event", id];
export const RELATED_EVENTS_QUERY_KEY = (id: string) => ["event", id];
export const CATEGORIES_QUERY_KEY = ["categories"];
export const SINGLE_CATEGORY_QUERY_KEY = (id: string) => ["category", id];
export const JOINED_EVENTS_QUERY_KEY = ["events", "joined"];
export const FAVORITE_EVENTS_QUERY_KEY = ["favorites"];
export const FAVORITE_QUERY_KEY = (id: string) => ["event-favorite", id];
export const BLOG_QUERY_KEY = ["blog"];
export const JOIN_REQUEST_QUERY_KEY = ["join-requests"];
export const JOIN_REQUEST_QUERY_KEY_BY_ID = (id: string) => [
  "join-requests",
  id,
];
export const EVENT_SUMMARY_QUERY_KEY = (id: string) => ["event-summary", id];
