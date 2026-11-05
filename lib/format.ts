export function formatCurrency(amountInCents: number, currency = "USD") {
  return (amountInCents / 100).toLocaleString("en-US", {
    style: "currency",
    currency,
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

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}
