import { getCashFlow } from "@/lib/queries/overview";
import { CashFlowChartView } from "./cash-flow-chart-view";

/** Loads a year of months once; the range switch only slices it on the client. */
export async function CashFlowChart() {
  const months = await getCashFlow(12);
  return <CashFlowChartView months={months} />;
}
