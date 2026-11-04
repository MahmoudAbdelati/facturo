export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export type InvoiceStatus = "pending" | "paid";

export type MonthlyRevenue = {
  month: string;
  revenue: number;
};

export type RecentInvoice = {
  id: string;
  name: string;
  email: string;
  amount: string;
};

export type InvoiceRow = {
  id: string;
  customer_id: string;
  name: string;
  email: string;
  date: string;
  amount: number;
  status: InvoiceStatus;
};

export type InvoiceFormData = {
  id: string;
  customer_id: string;
  amount: number;
  status: InvoiceStatus;
};

export type ClientOption = {
  id: string;
  name: string;
};

export type ClientRow = {
  id: string;
  name: string;
  email: string;
  total_invoices: number;
  total_pending: string;
  total_paid: string;
};
