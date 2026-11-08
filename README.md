<p align="center">
  <img src="app/icon.svg" width="56" height="56" alt="" />
</p>

<h1 align="center">Facturo</h1>

<p align="center">
  <strong>Get paid, not chased.</strong><br />
  Invoicing for freelancers and small studios.
</p>

<p align="center">
  <a href="https://getfacturo.vercel.app">Live demo</a> ·
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

Open the [live demo](https://getfacturo.vercel.app) and click **Try the demo**, or log in with:

| Email              | Password       |
| ------------------ | -------------- |
| `demo@facturo.app` | `facturo-demo` |

The demo workspace holds 25 fictional clients and about 150 invoices spread over the last year. Everyone shares it, so it resets to that state every night; feel free to edit or delete anything.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Server Components, Server Actions) and React 19
- [Postgres](https://www.postgresql.org) through [postgres.js](https://github.com/porsager/postgres), with plain SQL
- [Auth.js](https://authjs.dev) credentials login with bcrypt
- [Tailwind CSS](https://tailwindcss.com) with HSL design tokens and container queries, [lucide](https://lucide.dev) icons
- [Recharts](https://recharts.org) for the cash-flow chart, [Zod](https://zod.dev) for validation, [Sonner](https://sonner.emilkowal.ski) for toasts

## Getting started

You need Node.js 22.18 or newer (the scripts are TypeScript run directly by Node), [pnpm](https://pnpm.io) and a Postgres database (Neon, Supabase or a local one). SSL is required unless the URL ends in `?sslmode=disable`.

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
| `DEMO_DISABLED`                  | Set to `1` to hide the "Try the demo" button and turn off the nightly reset    |
| `CRON_SECRET`                    | Protects the nightly demo reset (production only, see Deploying)               |

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
| `pnpm test:e2e`    | Playwright smoke tests (needs `E2E_POSTGRES_URL`, see Tests)            |
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
e2e/             Playwright smoke tests
```

## Tests

The Playwright tests build the app, seed a database, then log in to the demo, create and delete an invoice and a client, and check the nightly reset. They change data, so they never use `POSTGRES_URL` from `.env`: give them a throwaway database instead (a local one, unless you set `E2E_ALLOW_REMOTE_DB=1`).

```bash
pnpm exec playwright install chromium
E2E_POSTGRES_URL="postgres://postgres:postgres@localhost:5432/facturo_e2e?sslmode=disable" pnpm test:e2e
```

GitHub Actions runs lint, type-check and these tests on every pull request and on pushes to `master`, against a Postgres service container.

## Deploying

Import the repository on [Vercel](https://vercel.com), add `POSTGRES_URL` and `AUTH_SECRET` (and optionally the demo variables), and deploy. Run `pnpm db:seed` once against the production database to create the tables.

The demo resets itself every night at 03:00 UTC: Vercel Cron (`vercel.json`) calls `/api/cron/reset-demo`, which replaces the clients, invoices and the demo user's profile with fresh seed data and keeps the schema. Add a `CRON_SECRET` environment variable (any long random string) so Vercel can call it; without one the route refuses every request.
