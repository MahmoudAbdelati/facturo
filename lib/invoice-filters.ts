import {
  DISPLAY_STATUSES,
  type DisplayStatus,
  type InvoiceFilters,
  type InvoiceSortKey,
  type SortDirection,
} from "@/lib/types";

export const SORT_KEYS = [
  "number",
  "client",
  "total",
  "issue_date",
  "due_date",
  "status",
] as const satisfies readonly InvoiceSortKey[];

export const DEFAULT_SORT: InvoiceSortKey = "issue_date";

/** The direction a column sorts in when you first click it. */
export const FIRST_DIRECTION: Record<InvoiceSortKey, SortDirection> = {
  number: "desc",
  client: "asc",
  total: "desc",
  issue_date: "desc",
  due_date: "asc",
  // Ascending puts overdue first.
  status: "asc",
};

export const SORT_LABELS: Record<InvoiceSortKey, string> = {
  number: "Invoice number",
  client: "Client",
  total: "Amount",
  issue_date: "Issue date",
  due_date: "Due date",
  status: "Status",
};

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function oneOf<T extends string>(value: string | undefined, options: readonly T[]): T | undefined {
  return options.includes(value as T) ? (value as T) : undefined;
}

/** Reads the list's filters from the URL, ignoring anything that isn't a known value. */
export function parseInvoiceFilters(params: RawParams | URLSearchParams): InvoiceFilters {
  const get = (key: string) =>
    params instanceof URLSearchParams ? (params.get(key) ?? undefined) : first(params[key]);

  const page = Math.floor(Number(get("page")));
  return {
    query: get("query")?.trim() || undefined,
    status: oneOf<DisplayStatus>(get("status"), DISPLAY_STATUSES),
    sort: oneOf(get("sort"), SORT_KEYS),
    dir: oneOf(get("dir"), ["asc", "desc"] as const),
    page: page > 1 ? page : undefined,
  };
}

/** The sort in effect, with defaults filled in. */
export function effectiveSort(filters: InvoiceFilters): { sort: InvoiceSortKey; dir: SortDirection } {
  const sort = filters.sort ?? DEFAULT_SORT;
  return { sort, dir: filters.dir ?? (filters.sort ? FIRST_DIRECTION[sort] : "desc") };
}

/** Query string for the given filters, leaving out defaults so URLs stay short. */
export function invoicesSearch(filters: InvoiceFilters) {
  const params = new URLSearchParams();
  if (filters.query) params.set("query", filters.query);
  if (filters.status) params.set("status", filters.status);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.dir) params.set("dir", filters.dir);
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));
  const search = params.toString();
  return search ? `?${search}` : "";
}

/** Link to the list after a change; anything but a page change goes back to page 1. */
export function invoicesHref(filters: InvoiceFilters, change: Partial<InvoiceFilters>) {
  const next = { ...filters, ...change };
  if (!("page" in change)) next.page = undefined;
  return `/invoices${invoicesSearch(next)}`;
}

/** Link that sorts by a column: flips the direction if it's already the sort. */
export function sortHref(filters: InvoiceFilters, key: InvoiceSortKey) {
  const current = effectiveSort(filters);
  const dir =
    current.sort === key ? (current.dir === "asc" ? "desc" : "asc") : FIRST_DIRECTION[key];
  return invoicesHref(filters, { sort: key, dir });
}
