import { sql } from "@/lib/db";
import type { ActivityEvent, CashFlowMonth, Kpis, OverdueInvoice, TopClient } from "@/lib/types";
import { invoicesWithTotals, withErrorMessage } from "./shared";

/**
 * Headline numbers for the last 30 days, each with the same measure for the
 * 30 days before. Outstanding and overdue are snapshots: today vs 30 days ago.
 * An invoice counts as sent from its issue date; drafts are left out.
 */
export function getKpis(): Promise<Kpis> {
  return withErrorMessage("Failed to load overview totals.", async () => {
    const [row] = await sql`
      WITH bounds AS (SELECT CURRENT_DATE AS today, CURRENT_DATE - 30 AS cutoff)
      SELECT
        COALESCE(SUM(total) FILTER (WHERE paid_at > cutoff), 0) AS collected,
        COALESCE(SUM(total) FILTER (WHERE paid_at > cutoff - 30 AND paid_at <= cutoff), 0) AS collected_prev,

        COALESCE(SUM(total) FILTER (WHERE status = 'sent'), 0) AS outstanding,
        COALESCE(SUM(total) FILTER (
          WHERE status <> 'draft' AND issue_date <= cutoff
            AND (status = 'sent' OR paid_at > cutoff)
        ), 0) AS outstanding_prev,

        COALESCE(SUM(total) FILTER (WHERE status = 'sent' AND due_date < today), 0) AS overdue,
        COALESCE(SUM(total) FILTER (
          WHERE status <> 'draft' AND due_date < cutoff
            AND (status = 'sent' OR paid_at > cutoff)
        ), 0) AS overdue_prev,

        AVG(paid_at - issue_date) FILTER (WHERE paid_at > cutoff)::float AS avg_days,
        AVG(paid_at - issue_date) FILTER (WHERE paid_at > cutoff - 30 AND paid_at <= cutoff)::float AS avg_days_prev
      FROM ${invoicesWithTotals()} i, bounds`;

    return {
      collected: {
        value: Number(row.collected),
        previous: Number(row.collected_prev),
      },
      outstanding: {
        value: Number(row.outstanding),
        previous: Number(row.outstanding_prev),
      },
      overdue: {
        value: Number(row.overdue),
        previous: Number(row.overdue_prev),
      },
      avgDaysToPay: { value: row.avg_days ?? 0, previous: row.avg_days_prev },
    };
  });
}

/**
 * Per calendar month, oldest first and including the current month: money
 * collected (by payment date) and invoiced (by issue date, drafts excluded).
 */
export function getCashFlow(months = 12): Promise<CashFlowMonth[]> {
  return withErrorMessage("Failed to load cash flow.", async () => {
    const rows = await sql`
      WITH months AS (
        SELECT generate_series(
          date_trunc('month', CURRENT_DATE) - make_interval(months => ${months - 1}),
          date_trunc('month', CURRENT_DATE),
          interval '1 month'
        )::date AS month
      ),
      i AS (SELECT * FROM ${invoicesWithTotals()} i)
      SELECT
        months.month::text AS month,
        COALESCE((
          SELECT SUM(total) FROM i
          WHERE date_trunc('month', i.paid_at) = months.month
        ), 0) AS collected,
        COALESCE((
          SELECT SUM(total) FROM i
          WHERE i.status <> 'draft' AND date_trunc('month', i.issue_date) = months.month
        ), 0) AS invoiced
      FROM months
      ORDER BY months.month`;

    return rows.map((row) => ({
      month: row.month,
      collected: Number(row.collected),
      invoiced: Number(row.invoiced),
    }));
  });
}

/** Latest invoices sent and payments received, newest first. */
export function getRecentActivity(limit = 6): Promise<ActivityEvent[]> {
  return withErrorMessage("Failed to load recent activity.", async () => {
    const rows = await sql`
      WITH i AS (
        SELECT i.*, clients.name AS client_name
        FROM ${invoicesWithTotals()} i
        JOIN clients ON clients.id = i.client_id
      ),
      events AS (
        SELECT 'paid' AS type, paid_at AS date, i.* FROM i WHERE paid_at IS NOT NULL
        UNION ALL
        SELECT 'sent' AS type, issue_date AS date, i.* FROM i WHERE status <> 'draft'
      )
      SELECT type, date::text AS date, id AS invoice_id, number, client_name, total
      FROM events
      WHERE date <= CURRENT_DATE
      ORDER BY date DESC, type = 'paid' DESC, number DESC
      LIMIT ${limit}`;

    return rows.map((row) => ({
      type: row.type,
      date: row.date,
      invoice_id: row.invoice_id,
      number: row.number,
      client_name: row.client_name,
      total: Number(row.total),
    }));
  });
}

/** Sent invoices past their due date, longest overdue first. */
export function getOverdueInvoices(limit = 5): Promise<OverdueInvoice[]> {
  return withErrorMessage("Failed to load overdue invoices.", async () => {
    const rows = await sql`
      SELECT
        i.id,
        i.number,
        clients.name AS client_name,
        i.due_date::text AS due_date,
        (CURRENT_DATE - i.due_date) AS days_overdue,
        i.total
      FROM ${invoicesWithTotals()} i
      JOIN clients ON clients.id = i.client_id
      WHERE i.status = 'sent' AND i.due_date < CURRENT_DATE
      ORDER BY i.due_date, i.number
      LIMIT ${limit}`;

    return rows.map((row) => ({
      id: row.id,
      number: row.number,
      client_name: row.client_name,
      due_date: row.due_date,
      days_overdue: Number(row.days_overdue),
      total: Number(row.total),
    }));
  });
}

/** Clients who paid the most over the last 12 months. */
export function getTopClients(limit = 5): Promise<TopClient[]> {
  return withErrorMessage("Failed to load top clients.", async () => {
    const rows = await sql`
      SELECT
        clients.id,
        clients.name,
        clients.company,
        SUM(i.total) AS collected,
        COUNT(*) AS invoice_count
      FROM ${invoicesWithTotals()} i
      JOIN clients ON clients.id = i.client_id
      WHERE i.paid_at > CURRENT_DATE - interval '12 months'
      GROUP BY clients.id
      ORDER BY collected DESC
      LIMIT ${limit}`;

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      company: row.company,
      collected: Number(row.collected),
      invoice_count: Number(row.invoice_count),
    }));
  });
}
