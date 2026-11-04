export function formatCurrency(amountInCents: number, currency = "USD") {
  return (amountInCents / 100).toLocaleString("en-US", {
    style: "currency",
    currency,
  });
}

export function formatDate(value: string | Date, locale = "en-US") {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
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
