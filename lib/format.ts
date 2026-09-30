/** Date/number formatting for the UI. Dates render in en-US, e.g. "Sep 29, 2026". */
const DATE = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
const DATETIME = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return DATE.format(typeof d === "string" ? new Date(d) : d);
}

export function formatDateTime(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return DATETIME.format(typeof d === "string" ? new Date(d) : d);
}

/** "2 hours ago" style relative time for the Attention Required feed. */
export function timeAgo(d: Date | string, now: Date = new Date()): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const diffMs = now.getTime() - date.getTime();
  const min = Math.round(diffMs / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const hours = Math.round(min / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  const days = Math.round(hours / 24);
  return `${days} ${days === 1 ? "day" : "days"} ago`;
}
