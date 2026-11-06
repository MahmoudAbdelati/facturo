"use client";

import { useId, useState } from "react";
import clsx from "clsx";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
  type TooltipValueType,
} from "recharts";
import { Card, CardHeader } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { CashFlowMonth } from "@/lib/types";

export const CHART_HEIGHT = 260;

const RANGES = [6, 12] as const;
type Range = (typeof RANGES)[number];

const monthShort = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });
const monthLong = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
const compact = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

// Colours come from the theme tokens, so the chart follows light and dark mode without JS.
const COLLECTED = "hsl(var(--accent))";
const INVOICED = "hsl(var(--muted-foreground))";

export function CashFlowChartView({ months }: { months: CashFlowMonth[] }) {
  const [range, setRange] = useState<Range>(12);
  // useId has characters (":", "«") that break a url(#id) reference.
  const gradientId = `cash-flow-${useId().replace(/[^\w-]/g, "")}`;
  const data = months.slice(-range);
  const collected = data.reduce((sum, m) => sum + m.collected, 0);
  const invoiced = data.reduce((sum, m) => sum + m.invoiced, 0);

  return (
    <Card className="@page-xl:col-span-3">
      <CardHeader
        title="Cash flow"
        description={`Last ${range} months`}
        actions={<RangeSwitch value={range} onChange={setRange} />}
      />
      <dl className="flex flex-wrap gap-x-8 gap-y-3 px-5 pt-4">
        <Total label="Collected" value={collected} color={COLLECTED} />
        <Total label="Invoiced" value={invoiced} color={INVOICED} dashed />
      </dl>
      <div className="px-2 pb-4 pt-4 sm:px-3" style={{ height: CHART_HEIGHT }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLLECTED} stopOpacity={0.3} />
                <stop offset="100%" stopColor={COLLECTED} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="month"
              tickFormatter={(value: string) => monthShort.format(new Date(value))}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              minTickGap={12}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <YAxis
              tickFormatter={(value: number) => compact.format(value / 100)}
              tickLine={false}
              axisLine={false}
              width={52}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <Tooltip
              content={ChartTooltip}
              cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="invoiced"
              name="Invoiced"
              stroke={INVOICED}
              strokeWidth={1.5}
              strokeDasharray="4 4"
              fill="none"
              activeDot={{ r: 3, strokeWidth: 0, fill: INVOICED }}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="collected"
              name="Collected"
              stroke={COLLECTED}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "hsl(var(--surface))", fill: COLLECTED }}
              animationDuration={600}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function RangeSwitch({ value, onChange }: { value: Range; onChange: (range: Range) => void }) {
  return (
    <div role="group" aria-label="Chart range" className="flex shrink-0 rounded-lg bg-muted p-0.5">
      {RANGES.map((range) => (
        <button
          key={range}
          type="button"
          aria-pressed={value === range}
          onClick={() => onChange(range)}
          className={clsx(
            "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
            value === range
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {range}M
        </button>
      ))}
    </div>
  );
}

function Total({
  label,
  value,
  color,
  dashed = false,
}: {
  label: string;
  value: number;
  color: string;
  dashed?: boolean;
}) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span
          aria-hidden="true"
          className="inline-block w-3 border-t-2"
          style={{ borderColor: color, borderStyle: dashed ? "dashed" : "solid" }}
        />
        {label}
      </dt>
      <dd className="mt-0.5 font-mono text-lg font-semibold tabular-nums">{formatCurrency(value)}</dd>
    </div>
  );
}

type ChartTooltipProps = Pick<TooltipContentProps<TooltipValueType, string>, "active" | "payload" | "label">;

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const month = payload[0].payload as CashFlowMonth;

  return (
    <div className="min-w-40 rounded-lg border border-border bg-surface-raised px-3 py-2 text-xs shadow-lg">
      <p className="mb-1.5 font-medium">{monthLong.format(new Date(String(label)))}</p>
      <TooltipRow label="Collected" value={month.collected} color={COLLECTED} />
      <TooltipRow label="Invoiced" value={month.invoiced} color={INVOICED} />
    </div>
  );
}

function TooltipRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-0.5">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ background: color }} />
        {label}
      </span>
      <span className="font-mono tabular-nums">{formatCurrency(value)}</span>
    </div>
  );
}
