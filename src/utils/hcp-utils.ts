// Utility: HCP data processing functions
// Handles data normalization, enrichment, and aggregate calculations
import { type HcpRecord } from "./data-generator";
import { type HcpRow, type GroupAggregates } from "../types/hcp";

// Normalize calls field to number (handles string → number conversion)
// Returns null if value is not a valid number (handles edge cases)
export function normalizeCalls(calls: number | string): number | null {
  const value = typeof calls === "string" ? Number(calls) : calls;
  return Number.isFinite(value) ? value : null;
}

// Calculate CPI (Calls Per Impact) - calls per 100 TRx
// Returns null if TRx is zero (division by zero protection)
export function calculateCPI(calls: number, trx: number): number | null {
  if (trx === 0) {
    return null;
  }
  return (calls / trx) * 100;
}

// Enrich records with unique row keys for edit tracking
// Converts HcpRecord (from generator) to HcpRow (with rowKey)
export function enrichWithRowKey(records: HcpRecord[]): HcpRow[] {
  return records.map((record, index) => ({
    ...record,
    rowKey: `row-${index}`,
  }));
}

// Calculate aggregate statistics for a group of rows
// Returns totals for calls, TRx, NRx, HCP count, and CPI
// Used for region/territory level summaries
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
