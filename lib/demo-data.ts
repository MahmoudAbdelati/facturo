// The demo workspace's contents: 25 clients and 150 invoices over ~14 months.
// Pure data, no database access. Shared by `pnpm db:seed` (plain Node, so only relative
// imports and erasable TypeScript here) and the nightly demo reset.
// Dates are generated relative to `today`, so the data always looks current. A fixed PRNG
// seed keeps the shape the same between runs.

import { randomUUID } from "node:crypto";

export const demoProfile = {
  name: "Alex Morgan",
  company: "Morgan Studio",
  currency: "USD",
};

const INVOICE_COUNT = 150;
const HISTORY_DAYS = 425; // ~14 months
const DAY = 86_400_000;

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type ClientSeed = {
  name: string;
  company: string;
  domain: string;
  country: string;
  phone: string | null;
  weight: number; // how often they get invoiced
};

const clientSeeds: ClientSeed[] = [
  { name: "Maya Lindqvist", company: "Harbor & Pine Studio", domain: "harborpine.se", country: "SE", phone: "+46 8 555 0142", weight: 9 },
  { name: "Tomás Herrera", company: "Kestrel Digital", domain: "kestreldigital.es", country: "ES", phone: "+34 91 555 0187", weight: 7 },
  { name: "Claire Dubois", company: "Lumen Atelier", domain: "lumenatelier.fr", country: "FR", phone: null, weight: 5 },
  { name: "Owen Gallagher", company: "Bright Furrow Farms", domain: "brightfurrow.ie", country: "IE", phone: "+353 1 555 0119", weight: 3 },
  { name: "Priya Raman", company: "Copperleaf Coffee Co.", domain: "copperleaf.in", country: "IN", phone: "+91 80 5550 1123", weight: 6 },
  { name: "Jonah Whitfield", company: "Saltmarsh Records", domain: "saltmarshrecords.co.uk", country: "GB", phone: "+44 20 7946 0321", weight: 4 },
  { name: "Petra Novák", company: "Ostrava Build Group", domain: "ostravabuild.cz", country: "CZ", phone: null, weight: 2 },
  { name: "Rachel Kim", company: "Tidewater Dental", domain: "tidewaterdental.com", country: "US", phone: "+1 757 555 0164", weight: 5 },
  { name: "Daniel Okafor", company: "Morrow & Vale Architects", domain: "morrowvale.ng", country: "NG", phone: "+234 1 555 0190", weight: 4 },
  { name: "Hannah Becker", company: "Fieldnote Press", domain: "fieldnotepress.de", country: "DE", phone: "+49 30 5550 1287", weight: 6 },
  { name: "Sofia Marchetti", company: "Quillwork Agency", domain: "quillwork.it", country: "IT", phone: null, weight: 8 },
  { name: "Kenji Watanabe", company: "Blue Lantern Games", domain: "bluelantern.jp", country: "JP", phone: "+81 3 5550 4471", weight: 5 },
  { name: "Lars Henriksen", company: "Greenline Cycles", domain: "greenlinecycles.dk", country: "DK", phone: "+45 32 55 01 98", weight: 3 },
  { name: "Youssef Benali", company: "Atlas Mountain Tours", domain: "atlasmountaintours.ma", country: "MA", phone: null, weight: 2 },
  { name: "Isabela Costa", company: "Paloma Skincare", domain: "palomaskincare.com.br", country: "BR", phone: "+55 11 5550 2214", weight: 5 },
  { name: "Ella Brooks", company: "Driftwood Yoga", domain: "driftwoodyoga.com.au", country: "AU", phone: null, weight: 2 },
  { name: "Noah Tremblay", company: "Cinder & Sage Bakery", domain: "cinderandsage.ca", country: "CA", phone: "+1 514 555 0133", weight: 3 },
  { name: "Aisha Rahman", company: "Halcyon Health", domain: "halcyonhealth.ae", country: "AE", phone: "+971 4 555 0176", weight: 6 },
  { name: "James Whitaker", company: "Ironbark Legal", domain: "ironbarklegal.com.au", country: "AU", phone: "+61 2 5550 1184", weight: 4 },
  { name: "Mei Lin Tan", company: "Little Fern Kids", domain: "littlefern.sg", country: "SG", phone: null, weight: 2 },
  { name: "Arjun Mehta", company: "Orbit Analytics", domain: "orbitanalytics.io", country: "US", phone: "+1 415 555 0158", weight: 8 },
  { name: "Grace Mensah", company: "Riverstone Realty", domain: "riverstonerealty.com.gh", country: "GH", phone: null, weight: 3 },
  { name: "Felix Wagner", company: "Vantage Point Media", domain: "vantagepoint.at", country: "AT", phone: "+43 1 555 0193", weight: 4 },
  { name: "Freya Campbell", company: "Wildmoor Outdoor", domain: "wildmoor.co.uk", country: "GB", phone: "+44 131 496 0712", weight: 3 },
  { name: "Mateo Silva", company: "Zephyr Labs", domain: "zephyrlabs.mx", country: "MX", phone: "+52 55 5550 3349", weight: 6 },
];

const notes = [
  "Thank you for your business!",
  "Payment by bank transfer within the stated terms, please.",
  "Please include the invoice number as the payment reference.",
  "Great working with you on this one.",
];

export type DemoClientRow = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string | null;
  country: string;
  created_at: string;
};

export type DemoInvoiceRow = {
  id: string;
  number: string;
  client_id: string;
  issue_date: string;
  due_date: string;
  status: "draft" | "sent" | "paid";
  currency: string;
  notes: string | null;
  paid_at: string | null;
};

export type DemoItemRow = {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  position: number;
};

export type DemoWorkspace = {
  clients: DemoClientRow[];
  invoices: DemoInvoiceRow[];
  items: DemoItemRow[];
};

/** Builds the demo rows. `now` defaults to the current time; only its UTC date is used. */
export function buildDemoWorkspace(now: Date = new Date()): DemoWorkspace {
  const rand = mulberry32(20261105);
  const int = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
  const pick = <T,>(items: readonly T[]) => items[Math.floor(rand() * items.length)];
  const chance = (p: number) => rand() < p;

  const today = new Date(now.toISOString().slice(0, 10) + "T00:00:00Z");
  const addDays = (d: Date, n: number) => new Date(d.getTime() + n * DAY);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const minDate = (a: Date, b: Date) => (a < b ? a : b);
  const monthName = (d: Date) => d.toLocaleString("en-US", { month: "long", timeZone: "UTC" });

  // Round a cent amount to a "priced by a human" value (multiples of $5).
  const roundPrice = (cents: number) => Math.round(cents / 500) * 500;

  type ItemTemplate = {
    description: (issued: Date) => string;
    quantity: () => number;
    unitPrice: () => number; // cents
  };

  const itemTemplates: ItemTemplate[] = [
    { description: () => `Brand identity – phase ${int(1, 3)}`, quantity: () => 1, unitPrice: () => roundPrice(int(240_000, 600_000)) },
    { description: (d) => `Monthly retainer – ${monthName(d)}`, quantity: () => 1, unitPrice: () => roundPrice(int(150_000, 350_000)) },
    { description: () => "UX audit and recommendations", quantity: () => 1, unitPrice: () => roundPrice(int(90_000, 180_000)) },
    { description: () => "Landing page design", quantity: () => 1, unitPrice: () => roundPrice(int(120_000, 280_000)) },
    { description: () => "Frontend development (hours)", quantity: () => int(8, 40), unitPrice: () => pick([8_500, 9_500, 11_000, 12_000]) },
    { description: () => "Design sprint workshop (days)", quantity: () => int(1, 3), unitPrice: () => 90_000 },
    { description: () => "Website copywriting (pages)", quantity: () => int(3, 8), unitPrice: () => roundPrice(int(15_000, 25_000)) },
    { description: () => "Custom illustrations", quantity: () => int(4, 12), unitPrice: () => roundPrice(int(12_000, 30_000)) },
    { description: () => "Hosting and maintenance", quantity: () => 1, unitPrice: () => roundPrice(int(12_000, 30_000)) },
    { description: () => "Product photography – half-day shoot", quantity: () => 1, unitPrice: () => roundPrice(int(65_000, 95_000)) },
    { description: () => "Additional revision round", quantity: () => int(1, 2), unitPrice: () => roundPrice(int(20_000, 40_000)) },
    { description: () => "Email template design", quantity: () => int(2, 5), unitPrice: () => roundPrice(int(18_000, 35_000)) },
    { description: () => "Strategy call (hours)", quantity: () => int(1, 3), unitPrice: () => 15_000 },
    { description: () => "Motion graphics – 30s spot", quantity: () => 1, unitPrice: () => roundPrice(int(180_000, 320_000)) },
    { description: () => "SEO setup and analytics", quantity: () => 1, unitPrice: () => roundPrice(int(60_000, 110_000)) },
  ];

  const clients = clientSeeds.map((c) => ({
    id: randomUUID(),
    name: c.name,
    company: c.company,
    email: `${c.name.split(" ")[0].toLowerCase().normalize("NFD").replace(/[^a-z]/g, "")}@${c.domain}`,
    phone: c.phone,
    country: c.country,
    weight: c.weight,
    firstIssue: today,
  }));

  const totalWeight = clients.reduce((s, c) => s + c.weight, 0);
  function pickClient() {
    let r = rand() * totalWeight;
    for (const c of clients) {
      r -= c.weight;
      if (r <= 0) return c;
    }
    return clients[clients.length - 1];
  }

  type InvoiceDraft = {
    id: string;
    client_id: string;
    issue_date: Date;
    due_date: Date;
    status: DemoInvoiceRow["status"];
    paid_at: Date | null;
    notes: string | null;
  };

  const invoices: InvoiceDraft[] = [];
  const items: DemoItemRow[] = [];
  let drafts = 0;

  for (let i = 0; i < INVOICE_COUNT; i++) {
    // sqrt bias puts more invoices in recent months, so the business looks like it's growing.
    const daysAgo = Math.floor(HISTORY_DAYS * (1 - Math.sqrt(rand())));
    const issue = addDays(today, -daysAgo);
    const due = addDays(issue, pick([14, 14, 30, 30, 30]));
    const client = pickClient();
    if (issue < client.firstIssue) client.firstIssue = issue;

    let status: InvoiceDraft["status"];
    let paidAt: Date | null = null;

    if (daysAgo <= 12 && drafts < 5 && chance(0.35)) {
      status = "draft";
      drafts++;
    } else if (due >= today) {
      // Not due yet: most are still open, some clients pay early.
      if (chance(0.25) && daysAgo >= 3) {
        status = "paid";
        paidAt = addDays(issue, int(2, daysAgo));
      } else {
        status = "sent";
      }
    } else {
      const daysPastDue = Math.round((today.getTime() - due.getTime()) / DAY);
      // A handful stay unpaid past due, mostly recent ones.
      if (chance(daysPastDue <= 75 ? 0.18 : 0.02)) {
        status = "sent";
      } else {
        status = "paid";
        const termDays = Math.round((due.getTime() - issue.getTime()) / DAY);
        const late = chance(0.2) ? int(1, 25) : -int(0, Math.floor(termDays * 0.8));
        paidAt = minDate(addDays(due, late), today);
      }
    }

    const id = randomUUID();
    invoices.push({
      id,
      client_id: client.id,
      issue_date: issue,
      due_date: due,
      status,
      paid_at: paidAt,
      notes: chance(0.4) ? pick(notes) : null,
    });

    const templates = [...itemTemplates].sort(() => rand() - 0.5).slice(0, int(1, 4));
    templates.forEach((t, position) => {
      items.push({
        id: randomUUID(),
        invoice_id: id,
        description: t.description(issue),
        quantity: t.quantity(),
        unit_price: t.unitPrice(),
        position,
      });
    });
  }

  // Number invoices in issue order, restarting each year: INV-2026-0042.
  invoices.sort((a, b) => a.issue_date.getTime() - b.issue_date.getTime());
  const perYear = new Map<number, number>();
  const invoiceRows: DemoInvoiceRow[] = invoices.map((inv) => {
    const year = inv.issue_date.getUTCFullYear();
    const n = (perYear.get(year) ?? 0) + 1;
    perYear.set(year, n);
    return {
      id: inv.id,
      number: `INV-${year}-${String(n).padStart(4, "0")}`,
      client_id: inv.client_id,
      issue_date: iso(inv.issue_date),
      due_date: iso(inv.due_date),
      status: inv.status,
      currency: demoProfile.currency,
      notes: inv.notes,
      paid_at: inv.paid_at ? iso(inv.paid_at) : null,
    };
  });

  const clientRows: DemoClientRow[] = clients.map((c) => ({
    id: c.id,
    name: c.name,
    company: c.company,
    email: c.email,
    phone: c.phone,
    country: c.country,
    created_at: iso(addDays(c.firstIssue, -int(1, 20))),
  }));

  return { clients: clientRows, invoices: invoiceRows, items };
}
