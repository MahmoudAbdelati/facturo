import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";

// Holding page until the real landing page is built.
const swatches = [
  { name: "Background", className: "bg-background" },
  { name: "Surface", className: "bg-surface" },
  { name: "Muted", className: "bg-muted" },
  { name: "Border", className: "bg-border" },
  { name: "Accent", className: "bg-accent" },
  { name: "Success", className: "bg-success" },
  { name: "Warning", className: "bg-warning" },
  { name: "Danger", className: "bg-danger" },
];

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-8">
        <Logo />
        <ThemeToggle />
      </header>

      <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-10 px-4 py-16 sm:px-8">
        <div className="space-y-4">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Invoicing for freelancers and small studios
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Get paid, not chased.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Send invoices, see what&apos;s paid, due and overdue, and keep an eye
            on your cash flow, all in one place.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
          >
            Log in <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Collected this month</span>
            <span className="font-mono text-2xl font-medium tabular-nums">
              $18,240.00
            </span>
          </div>
          <div className="mt-5 grid grid-cols-4 gap-3 sm:grid-cols-8">
            {swatches.map((swatch) => (
              <div key={swatch.name} className="space-y-1.5">
                <div
                  className={`h-10 rounded-md ring-1 ring-inset ring-border ${swatch.className}`}
                />
                <p className="text-xs text-muted-foreground">{swatch.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
