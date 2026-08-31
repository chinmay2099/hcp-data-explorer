// Hook: Manages hierarchical grouping of data by region → territory
// Handles expand/collapse state for tree-like data display
import { useState, useMemo, useCallback, useEffect } from "react";
import { type HcpRow } from "../types/hcp";
import {
  groupByRegionAndTerritory,
  flattenGroupedData,
} from "../utils/grouping.utils";

export function useGrouping(data: HcpRow[], autoExpand: boolean = false) {
  // State: which regions and territories are expanded (tree view)
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(
    new Set(),
  );
  const [expandedTerritories, setExpandedTerritories] = useState<Set<string>>(
    new Set(),
  );

  // Computed: hierarchical data structure (Map<Region, Map<Territory, HcpRow[]>>)
  const groupedData = useMemo(() => groupByRegionAndTerritory(data), [data]);

  // Effect: auto-expand all groups when enabled and data exists
  // Useful for initial load or when switching to "expand all" mode
  useEffect(() => {
    if (autoExpand && data.length > 0) {
      const allRegions = new Set(groupedData.keys());
      const allTerritories = new Set<string>();

      for (const [region, territories] of groupedData.entries()) {
        for (const territory of territories.keys()) {
          // Composite key: "region::territory" for unique identification
          allTerritories.add(`${region}::${territory}`);
        }
      }

      setExpandedRegions(allRegions);
      setExpandedTerritories(allTerritories);
    }
  }, [autoExpand, data.length, groupedData]);

  // Computed: flattened array for rendering (includes parent/child nodes)
  // Only includes expanded nodes in the output
  const renderItems = useMemo(
    () => flattenGroupedData(groupedData, expandedRegions, expandedTerritories),
    [groupedData, expandedRegions, expandedTerritories],
  );

  // Toggle: expand/collapse a region
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

  // Toggle: expand/collapse a territory within a region
  // Uses composite key to avoid conflicts across regions
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
