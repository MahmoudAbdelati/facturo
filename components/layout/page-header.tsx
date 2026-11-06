export function PageHeader({
  title,
  subtitle,
  back,
  actions,
}: {
  title: string;
  /** A line under the title, such as a client's company. */
  subtitle?: React.ReactNode;
  /** A link back to where the user came from, shown above the title. */
  back?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {back}
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}
