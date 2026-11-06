export function formatCurrency(amountInCents: number, currency = "USD") {
  return (amountInCents / 100).toLocaleString("en-US", {
    style: "currency",
    currency,
  });
}

/** "$5,445": for totals and notes where cents only add noise. Rounds to the nearest unit. */
export function formatWholeCurrency(amountInCents: number, currency = "USD") {
  return (amountInCents / 100).toLocaleString("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export function formatDate(value: string | Date, locale = "en-US") {
  // A plain YYYY-MM-DD is a calendar date: show it as-is, whatever the server's time zone.
  const dateOnly = typeof value === "string" && DATE_ONLY.test(value);
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: dateOnly ? "UTC" : undefined,
  }).format(new Date(value));
}

/** "Nov 18": for tight spots where the year is obvious from context. */
export function formatShortDate(value: string, locale = "en-US") {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone: "UTC" }).format(
    new Date(value.slice(0, 10)),
  );
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

const DAY = 86_400_000;

/** Whole days between two YYYY-MM-DD dates: positive when `to` is later. */
export function daysBetween(from: string, to: string) {
  return Math.round((new Date(to.slice(0, 10)).getTime() - new Date(from.slice(0, 10)).getTime()) / DAY);
}

/** Today as YYYY-MM-DD (UTC, matching how the dates above are read). */
export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}
