<p align="center">
  <img src="app/icon.svg" width="56" height="56" alt="" />
</p>

<h1 align="center">Facturo</h1>

<p align="center">
  <strong>Get paid, not chased.</strong><br />
  Invoicing for freelancers and small studios.
</p>

<p align="center">
  <a href="https://nextjs-dashboard-mh-dev1.vercel.app">Live demo</a> ·
  <a href="#getting-started">Run it locally</a>
</p>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="public/screenshots/overview-dark.webp" />
  <img src="public/screenshots/overview-light.webp" alt="The Facturo overview: KPI cards, a cash-flow chart, recent activity and overdue invoices" />
</picture>

## What it does

Facturo keeps track of who owes you what. You write invoices with line items, send them, mark them paid, and the app tells you what is outstanding, what is late and how your cash flow is trending.

- **Overview** – collected, outstanding and overdue amounts with trends against the previous 30 days, average days to pay, a 6/12-month cash-flow chart, recent activity, top clients and a "needs a nudge" list of overdue invoices.
- **Invoices** – search, status tabs with counts, sortable columns, pagination and CSV export, all driven by the URL so every view can be bookmarked.
- **Invoice editor** – line items with live totals, payment-term shortcuts, notes and draft/sent/paid status. On phones, line items open in a bottom sheet.
- **Invoice page** – a printable invoice document (print or save as PDF), a payment timeline, duplicate, and one-click status changes.
- **Clients** – a client list with totals, client pages with their invoices and payment stats, and full create/edit/delete.
- **Settings** – profile, company name, default currency, theme and password.
- **Everywhere** – light and dark themes, a collapsible sidebar, a phone layout with bottom navigation, keyboard search (<kbd>/</kbd>), and 100 Lighthouse accessibility scores.

Overdue is never stored: an invoice is overdue when it has been sent and its due date has passed, so the status is always right.

<table>
  <tr>
    <td width="50%">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="public/screenshots/invoices-dark.webp" />
        <img src="public/screenshots/invoices-light.webp" alt="The invoices list with status tabs, search and sorting" />
      </picture>
    </td>
    <td width="50%">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="public/screenshots/invoice-dark.webp" />
        <img src="public/screenshots/invoice-light.webp" alt="An invoice page with the printable document and its payment summary" />
      </picture>
    </td>
  </tr>
</table>

## Try the demo

Open the [live demo](https://nextjs-dashboard-mh-dev1.vercel.app) and click **Try the demo**, or log in with:

| Email              | Password       |
| ------------------ | -------------- |
| `demo@facturo.app` | `facturo-demo` |

The demo workspace holds 25 fictional clients and about 150 invoices spread over the last year.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Server Components, Server Actions) and React 19
- [Postgres](https://www.postgresql.org) through [postgres.js](https://github.com/porsager/postgres), with plain SQL
- [Auth.js](https://authjs.dev) credentials login with bcrypt
- [Tailwind CSS](https://tailwindcss.com) with HSL design tokens and container queries, [lucide](https://lucide.dev) icons
- [Recharts](https://recharts.org) for the cash-flow chart, [Zod](https://zod.dev) for validation, [Sonner](https://sonner.emilkowal.ski) for toasts

## Getting started

You need Node.js 22.18 or newer (the scripts are TypeScript run directly by Node), [pnpm](https://pnpm.io) and a Postgres database (Neon, Supabase or a local one; SSL is required).

```bash
pnpm install
cp .env.example .env
```

Fill in `.env`:

| Variable                         | What it is                                                                     |
| -------------------------------- | ------------------------------------------------------------------------------ |
| `POSTGRES_URL`                   | Postgres connection string                                                     |
| `AUTH_SECRET`                    | Session secret, generate one with `npx auth secret`                            |
| `DEMO_EMAIL` / `DEMO_PASSWORD`   | The demo account the seed creates and "Try the demo" logs in to                |
| `SITE_URL`                       | Public URL for social cards (optional; Vercel provides its production domain)  |
| `DEMO_DISABLED`                  | Set to `1` to hide the "Try the demo" button                                   |

Create the tables and the demo data, then start the app:

```bash
pnpm db:seed
pnpm dev
```

`pnpm db:seed` drops and recreates every table, so only run it against a database you can wipe. Dates in the demo data are relative to the day you seed, so the charts always end today.

## Scripts

| Command            | What it does                                                            |
| ------------------ | ----------------------------------------------------------------------- |
| `pnpm dev`         | Development server on http://localhost:3000                             |
| `pnpm build`       | Production build                                                        |
| `pnpm start`       | Serve the production build                                              |
| `pnpm lint`        | ESLint                                                                  |
| `pnpm db:seed`     | Reset the database and load the demo workspace                          |
| `pnpm screenshots` | Retake the screenshots in `public/screenshots` from a running app       |

## Project structure

```
app/
  (marketing)/   landing page
  (auth)/        login
  (app)/         overview, invoices, clients, settings (signed in)
components/      ui kit, layout shell and feature components
lib/
  queries/       SQL reads, amounts in cents
  actions/       Server Actions (invoices, clients, settings, auth)
  validations/   Zod schemas
scripts/         seed and screenshot scripts
```

## Deploying

Import the repository on [Vercel](https://vercel.com), add `POSTGRES_URL` and `AUTH_SECRET` (and optionally the demo variables), and deploy. Run `pnpm db:seed` once against the production database to create the tables.
