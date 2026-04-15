export function stripHtml(html: string, maxLength?: number): string {
  if (!html) return "";
  let result = html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
  if (maxLength) {
    result = result.slice(0, maxLength);
  }
  return result;
}
