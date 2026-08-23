import { useState, useMemo, useCallback } from "react";
import { type HcpRow } from "../types/hcp";
import {
  groupByRegionAndTerritory,
  flattenGroupedData,
} from "./grouping.utils";

export function useGrouping(data: HcpRow[]) {
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(
    new Set(),
  );
  const [expandedTerritories, setExpandedTerritories] = useState<Set<string>>(
    new Set(),
  );

  const groupedData = useMemo(() => groupByRegionAndTerritory(data), [data]);

  const renderItems = useMemo(
    () => flattenGroupedData(groupedData, expandedRegions, expandedTerritories),
    [groupedData, expandedRegions, expandedTerritories],
  );

  const toggleRegion = useCallback((region: string) => {
    setExpandedRegions((prev) => {
      const next = new Set(prev);
      if (next.has(region)) {
        next.delete(region);
      } else {
        next.add(region);
      }
      return next;
    });
  }, []);

  const toggleTerritory = useCallback((region: string, territory: string) => {
    setExpandedTerritories((prev) => {
      const next = new Set(prev);
      const key = `${region}::${territory}`;
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  return {
    renderItems,
    toggleRegion,
    toggleTerritory,
    expandedRegions,
    expandedTerritories,
  };
}
