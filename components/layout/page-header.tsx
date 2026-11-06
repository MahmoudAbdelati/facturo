import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Crumb = { label: string; href: string };

export function PageHeader({
  title,
  crumbs,
  back,
  actions,
}: {
  title: string;
  crumbs?: Crumb[];
  /** A link back to where the user came from, shown instead of breadcrumbs. */
  back?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {back}
        {!back && crumbs && (
          <nav aria-label="Breadcrumb" className="mb-1">
            <ol className="flex items-center gap-1 text-sm text-muted-foreground">
              {crumbs.map((crumb) => (
                <li key={crumb.href} className="flex items-center gap-1">
                  <Link href={crumb.href} className="hover:text-foreground">
                    {crumb.label}
                  </Link>
                  <ChevronRight className="h-3.5 w-3.5" />
                </li>
              ))}
            </ol>
          </nav>
        )}
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      </div>
      {actions}
    </div>
  );
}
