import Link from "next/link";
import clsx from "clsx";
import {
  ArrowRight,
  BellRing,
  ChartArea,
  FileSpreadsheet,
  Printer,
  ReceiptText,
  UsersRound,
} from "lucide-react";
import { DemoButton } from "@/components/auth/demo-button";
import { Logo } from "@/components/brand/logo";
import { CONTENT_CROP, ProductShot } from "@/components/marketing/product-shot";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { buttonClasses } from "@/components/ui/button";
import { demoEnabled } from "@/lib/demo";

const features = [
  {
    icon: ReceiptText,
    title: "Invoices in a minute",
    body: "Line items, payment terms and notes. Numbers are assigned for you, in order, every year.",
  },
  {
    icon: BellRing,
    title: "Overdue, spotted for you",
    body: "Anything past its due date moves to the top, with how many days late it is.",
  },
  {
    icon: ChartArea,
    title: "Cash flow at a glance",
    body: "What you invoiced against what came in, month by month, for the last six or twelve months.",
  },
  {
    icon: UsersRound,
    title: "A page for every client",
    body: "What they've paid, what they owe and how long they usually take, next to every invoice you've sent them.",
  },
  {
    icon: Printer,
    title: "Clean PDFs",
    body: "Print any invoice to a tidy, paper-ready PDF, named after the invoice number and client.",
  },
  {
    icon: FileSpreadsheet,
    title: "Your data, exportable",
    body: "Export any filtered list to CSV for your accountant or your own spreadsheet.",
  },
];

const showcase = [
  {
    shot: "invoices",
    eyebrow: "Invoices",
    title: "Know who owes you, and since when",
    body: "Filter by status, search by client or number, and sort by what matters today. Mark an invoice as sent or paid straight from the list.",
    alt: "The invoices list, filtered by status, with amounts, due dates and status badges",
  },
  {
    shot: "invoice",
    eyebrow: "Invoice page",
    title: "Invoices that look like you mean business",
    body: "Every invoice gets a clean page your client would be happy to receive, with the amount due, the timeline and the next step one click away.",
    alt: "An invoice ready to print, with the amount due and its timeline beside it",
  },
  {
    shot: "client",
    eyebrow: "Clients",
    title: "The whole relationship on one page",
    body: "Paid to date, outstanding, average days to pay, contact details and every invoice. Start a new invoice for them from right there.",
    alt: "A client page with totals, contact details and their invoices",
  },
] as const;

const steps = [
  { title: "Add a client", body: "Name, email and country. That's all an invoice needs." },
  { title: "Send the invoice", body: "Add line items, pick the terms, print or save it as a PDF." },
  { title: "Mark it paid", body: "Your cash flow and client totals update the moment you do." },
];

/** Signed-in visitors go straight to the app; trying the demo would switch their account. */
function OpenApp({ size = "md", className }: { size?: "md" | "sm"; className?: string }) {
  return (
    <Link href="/overview" className={clsx(buttonClasses("primary", size), className)}>
      Open Facturo <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

function TryDemo({ size = "md", className }: { size?: "md" | "sm"; className?: string }) {
  if (!demoEnabled) {
    return (
      <Link href="/login" className={buttonClasses("primary", size)}>
        Log in <ArrowRight className="h-4 w-4" />
      </Link>
    );
  }
  return <DemoButton size={size} className={className} />;
}

/**
 * The public landing page. It is built twice, statically: signed out at `/` and signed in at
 * `/welcome-back`, which the auth middleware serves at `/` to signed-in visitors (auth.config.ts).
 */
export function LandingPage({ signedIn }: { signedIn: boolean }) {
  return (
    <div className="min-h-screen overflow-x-clip">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md backdrop-saturate-150">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" aria-label="Facturo home">
            <Logo />
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
            <a href="#tour" className="transition-colors hover:text-foreground">Tour</a>
            <a href="#how-it-works" className="transition-colors hover:text-foreground">How it works</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle className="hidden sm:inline-flex" />
            {signedIn ? (
              <OpenApp size="sm" />
            ) : (
              <>
                <Link href="/login" className={buttonClasses("ghost", "sm")}>
                  Log in
                </Link>
                <TryDemo size="sm" className="hidden sm:inline-flex" />
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[40rem] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,hsl(var(--accent)/0.18),transparent_70%)]"
          />
          <div className="mx-auto max-w-6xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pt-24">
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Invoicing for freelancers and small studios
            </p>
            <h1 className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
              Get paid, not chased.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-muted-foreground">
              Send invoices, see at a glance what&apos;s paid, due and overdue, and keep an eye on
              your cash flow, without a spreadsheet in sight.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {signedIn ? (
                <OpenApp className="w-full sm:w-auto" />
              ) : (
                <>
                  <TryDemo className="w-full sm:w-auto" />
                  <Link href="/login" className={clsx(buttonClasses("secondary", "md"), "w-full sm:w-auto")}>
                    Log in
                  </Link>
                </>
              )}
            </div>
            {demoEnabled && !signedIn && (
              <p className="mt-4 text-sm text-muted-foreground">
                No sign-up. You&apos;ll land in a sample studio with a year of invoices.
              </p>
            )}

            <ProductShot
              name="overview"
              eager
              alt="The Facturo overview: money collected, outstanding and overdue, a cash flow chart and recent activity"
              className="mt-14 text-left sm:mt-20"
            />
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-16 border-t border-border bg-surface/50">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Everything you need to get paid. Nothing you don&apos;t.
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Facturo does the bookkeeping-adjacent chores so you can get back to the work
                you&apos;re invoicing for.
              </p>
            </div>
            <ul className="mt-12 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, body }) => (
                <li key={title} className="bg-background p-6 sm:p-8">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-subtle text-accent-subtle-foreground">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Tour */}
        <section id="tour" className="scroll-mt-16 border-t border-border">
          <div className="mx-auto max-w-6xl space-y-20 px-4 py-20 sm:px-6 sm:py-24 lg:space-y-28">
            {showcase.map((item, index) => (
              <div key={item.shot} className="grid items-center gap-8 lg:grid-cols-5 lg:gap-12">
                <div className={index % 2 ? "lg:order-2 lg:col-span-2" : "lg:col-span-2"}>
                  <p className="text-sm font-medium text-accent-subtle-foreground">{item.eyebrow}</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{item.title}</h2>
                  <p className="mt-4 text-muted-foreground">{item.body}</p>
                </div>
                <ProductShot
                  name={item.shot}
                  alt={item.alt}
                  crop={CONTENT_CROP}
                  sizes="(min-width: 1024px) 810px, 120vw"
                  className="lg:col-span-3"
                />
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-16 border-t border-border bg-surface/50">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Three steps to paid</h2>
            <ol className="mt-12 grid gap-6 md:grid-cols-3">
              {steps.map((step, index) => (
                <li key={step.title} className="rounded-xl border border-border bg-background p-6">
                  <span className="font-mono text-sm text-accent-subtle-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Call to action */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-surface px-6 py-14 text-center sm:px-12">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_50%_100%,hsl(var(--accent)/0.15),transparent_70%)]"
              />
              <h2 className="relative text-3xl font-semibold tracking-tight sm:text-4xl">
                {signedIn ? "Pick up where you left off." : "See where your money stands."}
              </h2>
              <p className="relative mx-auto mt-4 max-w-md text-muted-foreground">
                {signedIn
                  ? "Your invoices, clients and cash flow are waiting."
                  : "Click around a workspace with real-looking clients and a year of invoices."}
              </p>
              <div className="relative mt-8 flex justify-center">
                {signedIn ? <OpenApp /> : <TryDemo />}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <Logo wordmarkClassName="text-base" />
            <span className="hidden sm:inline">·</span>
            <span>Get paid, not chased.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href={signedIn ? "/overview" : "/login"} className="transition-colors hover:text-foreground">
              {signedIn ? "Open Facturo" : "Log in"}
            </Link>
            <ThemeToggle className="sm:hidden" />
            <span>© {new Date().getFullYear()} Facturo</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
