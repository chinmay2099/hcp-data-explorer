// Hook: Manages column sorting with 3-state toggle (asc → desc → none)
// Cycles through sort directions when clicking same column
import { useState, useMemo, useCallback } from "react";
import { type HcpRow } from "../types/hcp";
import {
  sortRows,
  type SortState,
  type SortColumn,
  type SortDirection,
} from "../utils/sorting.utils";

export function useSorting(data: HcpRow[]) {
  // State: current sort column and direction
  const [sortState, setSortState] = useState<SortState>({
    column: "name",
    direction: "none",
  });

  // Computed: sorted data (or original if no sort active)
  const sortedData = useMemo(() => {
    if (sortState.direction === "none") {
      return data;
    }
    return sortRows(data, sortState);
  }, [data, sortState]);

  // Handler: toggle sort on a column
  // Logic: new column → asc; same column → cycle (asc → desc → none)
  const toggleSort = useCallback((column: SortColumn) => {
    setSortState((prev) => {
      if (prev.column !== column) {
        return { column, direction: "asc" };
      }

      const directions: SortDirection[] = ["asc", "desc", "none"];
      const currentIndex = directions.indexOf(prev.direction);
      const nextIndex = (currentIndex + 1) % directions.length;

      return { column, direction: directions[nextIndex] };
    });
  }, []);

  return {
    sortState,
    sortedData,
    toggleSort,
  };
}
