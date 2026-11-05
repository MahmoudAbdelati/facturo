export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  company_name: string | null;
  currency: string;
};

/** What the database stores. */
export type InvoiceStatus = "draft" | "sent" | "paid";

/** What the app shows: a sent invoice past its due date is overdue. */
export type DisplayStatus = InvoiceStatus | "overdue";

export const DISPLAY_STATUSES = [
  "draft",
  "sent",
  "overdue",
  "paid",
] as const satisfies readonly DisplayStatus[];

// All amounts are integer cents.

export type InvoiceRow = {
  id: string;
  number: string;
  client_id: string;
  client_name: string;
  client_company: string | null;
  client_email: string;
  issue_date: string;
  due_date: string;
  paid_at: string | null;
  status: DisplayStatus;
  currency: string;
  total: number;
};

export type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
};

export type InvoiceDetail = InvoiceRow & {
  stored_status: InvoiceStatus;
  notes: string | null;
  client_phone: string | null;
  client_country: string | null;
  items: InvoiceItem[];
};

export type InvoiceSortKey = "number" | "client" | "total" | "issue_date" | "due_date" | "status";
export type SortDirection = "asc" | "desc";

export type InvoiceFilters = {
  query?: string;
  status?: DisplayStatus;
  clientId?: string;
  sort?: InvoiceSortKey;
  dir?: SortDirection;
  page?: number;
};

export type StatusCounts = Record<DisplayStatus | "all", number>;

export type Kpi = {
  value: number;
  /** Same measure over the previous period; null when there is nothing to compare. */
  previous: number | null;
};

export type Kpis = {
  collected: Kpi;
  outstanding: Kpi;
  overdue: Kpi;
  avgDaysToPay: Kpi;
};

export type CashFlowMonth = {
  /** First day of the month, YYYY-MM-DD. */
  month: string;
  collected: number;
  invoiced: number;
};

export type ActivityEvent = {
  type: "sent" | "paid";
  date: string;
  invoice_id: string;
  number: string;
  client_name: string;
  total: number;
};

export type OverdueInvoice = {
  id: string;
  number: string;
  client_name: string;
  due_date: string;
  days_overdue: number;
  total: number;
};

export type TopClient = {
  id: string;
  name: string;
  company: string | null;
  collected: number;
  invoice_count: number;
};

export type ClientOption = {
  id: string;
  name: string;
};

export type ClientRow = {
  id: string;
  name: string;
  company: string | null;
  email: string;
  country: string | null;
  invoice_count: number;
  outstanding: number;
  overdue: number;
  paid: number;
  last_issue_date: string | null;
};

export type ClientDetail = ClientRow & {
  phone: string | null;
  created_at: string;
  avg_days_to_pay: number | null;
};
