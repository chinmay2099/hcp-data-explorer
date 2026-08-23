import { type HcpRow } from "../types/hcp";
import { normalizeCalls } from "../lib/hcp-utils";

export type SortColumn = "name" | "calls" | "trx" | "nrx" | "cpi";
export type SortDirection = "asc" | "desc" | "none";

export interface SortState {
  column: SortColumn;
  direction: SortDirection;
}

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

function calculateRowCPI(row: HcpRow): number | null {
  const normalizedCalls = normalizeCalls(row.calls);
  if (!normalizedCalls) return null;
  if (row.trx === 0) return null;
  return (normalizedCalls / row.trx) * 100;
}
