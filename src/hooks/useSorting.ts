import { useState, useMemo, useCallback } from "react";
import { type HcpRow } from "../types/hcp";
import {
  sortRows,
  type SortState,
  type SortColumn,
  type SortDirection,
} from "./sorting.utils";

export function useSorting(data: HcpRow[]) {
  const [sortState, setSortState] = useState<SortState>({
    column: "name",
    direction: "none",
  });

  const sortedData = useMemo(() => {
    if (sortState.direction === "none") {
      return data;
    }
    return sortRows(data, sortState);
  }, [data, sortState]);

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
