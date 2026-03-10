import { Locale } from "./config";

export function setLocaleCookie(locale: Locale) {
  document.cookie = `locale=${locale};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
}
