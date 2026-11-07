import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { CircleCheck } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/brand/logo";
import { CONTENT_CROP, ProductShot } from "@/components/marketing/product-shot";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { demoEnabled } from "@/lib/demo";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your Facturo workspace.",
};

const points = [
  "See what's paid, due and overdue at a glance",
  "Invoices your clients are happy to receive",
  "Cash flow and client totals that update themselves",
];

export default function LoginPage() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col px-4 py-6 sm:px-8">
        <header className="flex items-center justify-between">
          <Link href="/" aria-label="Facturo home">
            <Logo />
          </Link>
          <ThemeToggle />
        </header>

        <main className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-sm">
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="mb-8 mt-1.5 text-sm text-muted-foreground">
              Log in to your Facturo workspace.
            </p>
            <Suspense>
              <LoginForm showDemo={demoEnabled} />
            </Suspense>
          </div>
        </main>

        <footer className="text-center text-xs text-muted-foreground lg:text-left">
          © {new Date().getFullYear()} Facturo · Get paid, not chased.
        </footer>
      </div>

      {/* Brand panel, from lg */}
      <aside className="relative hidden overflow-hidden border-l border-border bg-surface lg:flex lg:flex-col lg:justify-center lg:px-12 xl:px-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_70%_20%,hsl(var(--accent)/0.14),transparent_70%)]"
        />
        <div className="relative max-w-lg">
          <h2 className="text-3xl font-semibold tracking-tight">Get paid, not chased.</h2>
          <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
            {points.map((point) => (
              <li key={point} className="flex items-center gap-2.5">
                <CircleCheck className="h-4 w-4 shrink-0 text-accent-subtle-foreground" aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
        </div>
        {/* Runs off the right edge on purpose. */}
        <ProductShot
          name="overview"
          crop={CONTENT_CROP}
          eager
          alt="The Facturo overview with collected, outstanding and overdue totals and a cash flow chart"
          sizes="(min-width: 1024px) 50vw, 0px"
          className="relative mt-12 w-[140%] max-w-none"
        />
      </aside>
    </div>
  );
}
