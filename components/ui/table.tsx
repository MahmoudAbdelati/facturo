import clsx from "clsx";

/**
 * Thin, styled wrappers around table elements. Layout (fixed columns, widths,
 * which breakpoint shows the table) stays with each feature table.
 */

export function Table({ className, ...rest }: React.TableHTMLAttributes<HTMLTableElement>) {
  return <table {...rest} className={clsx("w-full text-sm", className)} />;
}

export function TableHead({ className, ...rest }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead {...rest} className={clsx("border-b border-border text-left text-muted-foreground", className)} />
  );
}

export function TableBody({ className, ...rest }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...rest} className={clsx("divide-y divide-border", className)} />;
}

export function TableRow({ className, ...rest }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr {...rest} className={clsx("hover:bg-muted/40", className)} />;
}

export function TableHeader({ className, ...rest }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th scope="col" {...rest} className={clsx("px-3 py-3 font-medium", className)} />;
}

export function TableCell({ className, ...rest }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td {...rest} className={clsx("px-3 py-3", className)} />;
}
