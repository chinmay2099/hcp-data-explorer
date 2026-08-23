import { type HcpRecord } from "./data-generator";
import { type HcpRow, type GroupAggregates } from "../types/hcp";

export function normalizeCalls(calls: number | string): number | null {
  const value = typeof calls === "string" ? Number(calls) : calls;
  return Number.isFinite(value) ? value : null;
}

export function calculateCPI(calls: number, trx: number): number | null {
  if (trx === 0) {
    return null;
  }
  return (calls / trx) * 100;
}

export function enrichWithRowKey(records: HcpRecord[]): HcpRow[] {
  return records.map((record, index) => ({
    ...record,
    rowKey: `row-${index}`,
  }));
}

export function calculateGroupAggregates(rows: HcpRow[]): GroupAggregates {
  let totalCalls = 0;
  let totalTRx = 0;
  let totalNRx = 0;

  for (const row of rows) {
    const normalizedCalls = normalizeCalls(row.calls);
    if (normalizedCalls !== null) {
      totalCalls += normalizedCalls;
    }
    totalTRx += row.trx;
    totalNRx += row.nrx;
  }

  const cpi = calculateCPI(totalCalls, totalTRx);

  return {
    totalCalls,
    totalTRx,
    totalNRx,
    hcpCount: rows.length,
    cpi,
  };
}
