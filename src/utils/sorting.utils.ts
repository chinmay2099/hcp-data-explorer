// Utility: Sorting functions for HCP data
// Supports sorting by name, calls, TRx, NRx, or calculated CPI
// Handles mixed data types (string/number) and null values gracefully
import { type HcpRow } from "../types/hcp";
import { normalizeCalls } from "./hcp-utils";

// Supported sortable columns
export type SortColumn = "name" | "calls" | "trx" | "nrx" | "cpi";
// Sort direction: ascending, descending, or none (no sort)
export type SortDirection = "asc" | "desc" | "none";

// Current sort state (column + direction)
export interface SortState {
  column: SortColumn;
  direction: SortDirection;
}

// Sort rows based on current sort state
// Returns new array (immutable), handles "none" direction by returning unsorted
// Uses multiplier (-1 for desc, 1 for asc) to reverse comparison
export function sortRows(rows: HcpRow[], sortState: SortState): HcpRow[] {
  if (sortState.direction === "none") {
    return [...rows];
  }

  const { column, direction } = sortState;
  const multiplier = direction === "asc" ? 1 : -1;

  return [...rows].sort((a, b) => {
    let comparison = 0;

    switch (column) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "calls":
        const callsA = normalizeCalls(a.calls) || 0;
        const callsB = normalizeCalls(b.calls) || 0;
        comparison = callsA - callsB;
        break;
      case "trx":
        comparison = a.trx - b.trx;
        break;
      case "nrx":
        comparison = a.nrx - b.nrx;
        break;
      case "cpi":
        const cpiA = calculateRowCPI(a);
        const cpiB = calculateRowCPI(b);
        comparison = (cpiA ?? 0) - (cpiB ?? 0);
        break;
    }

    return comparison * multiplier;
  });
}

// Calculate CPI for a single row
// Returns null if calls is invalid or TRx is zero
function calculateRowCPI(row: HcpRow): number | null {
  const normalizedCalls = normalizeCalls(row.calls);
  if (!normalizedCalls) return null;
  if (row.trx === 0) return null;
  return (normalizedCalls / row.trx) * 100;
}
