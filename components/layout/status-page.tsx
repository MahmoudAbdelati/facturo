import Link from "next/link";
import clsx from "clsx";
import { Logo } from "@/components/brand/logo";

/**
 * A full-screen page outside the app shell: unknown URLs and errors the shell itself
 * couldn't survive. `code` is the big faded number behind the title.
 */
export function StatusPage({
  code,
  title,
  description,
  actions,
  footnote,
}: {
  code: string;
  title: string;
  description: React.ReactNode;
  actions: React.ReactNode;
  footnote?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="px-4 py-5 sm:px-6 lg:px-10">
        <Link href="/" aria-label="Facturo home" className="inline-flex rounded-lg">
          <Logo />
        </Link>
      </header>
      <main className="flex grow items-center justify-center px-4 pb-24 pt-8 sm:px-6">
        <div className="max-w-md text-center">
          <p
            aria-hidden
            className="select-none bg-gradient-to-b from-foreground/15 to-foreground/0 bg-clip-text font-mono text-8xl font-semibold tracking-tighter text-transparent sm:text-9xl"
          >
            {code}
          </p>
          <h1 className="-mt-4 text-2xl font-semibold tracking-tight sm:-mt-6">{title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">{description}</p>
          <div className="mt-8 flex flex-col justify-center gap-2 sm:flex-row">{actions}</div>
          {footnote && <p className="mt-6 font-mono text-xs text-muted-foreground">{footnote}</p>}
        </div>
      </main>
    </div>
  );
}

/** The same message inside the app shell, for errors on a single page. */
export function InlineStatus({
  icon: Icon,
  title,
  description,
  actions,
  footnote,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: React.ReactNode;
  actions: React.ReactNode;
  footnote?: React.ReactNode;
  className?: string;
}) {
  return (
    <div role="alert" className={clsx("flex flex-col items-center px-6 py-20 text-center", className)}>
      <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-danger/10">
        <Icon className="h-5 w-5 text-danger" />
      </span>
      <h1 className="text-lg font-semibold">{title}</h1>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">{actions}</div>
      {footnote && <p className="mt-5 font-mono text-xs text-muted-foreground">{footnote}</p>}
    </div>
  );
}
