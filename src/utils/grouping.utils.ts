// Utility: Grouping and flattening functions for hierarchical data display
// Groups data by region → territory, then flattens to renderable items
// Calculates aggregates (sums, counts, CPI) at each group level
import { type HcpRow, type RenderItem } from "../types/hcp";
import { calculateGroupAggregates } from "./hcp-utils";

// Group rows by region, then by territory within each region
// Returns nested Map structure: Map<Region, Map<Territory, HcpRow[]>>
export function groupByRegionAndTerritory(
  rows: HcpRow[],
): Map<string, Map<string, HcpRow[]>> {
  const grouped = new Map<string, Map<string, HcpRow[]>>();

  for (const row of rows) {
    if (!grouped.has(row.region)) {
      grouped.set(row.region, new Map());
    }
    const territoryMap = grouped.get(row.region)!;
    if (!territoryMap.has(row.territory)) {
      territoryMap.set(row.territory, []);
    }
    territoryMap.get(row.territory)!.push(row);
  }

  return grouped;
}

// Flatten grouped data into renderable items array
// Only includes expanded nodes (respects expand/collapse state)
// Returns array of RenderItem objects (region, territory, or row type)
// Each item includes aggregates at that level
export function flattenGroupedData(
  groupedData: Map<string, Map<string, HcpRow[]>>,
  expandedRegions: Set<string>,
  expandedTerritories: Set<string>,
): RenderItem[] {
  const items: RenderItem[] = [];

  for (const [region, territories] of groupedData.entries()) {
    // Calculate aggregates for all rows in this region
    const regionRows = Array.from(territories.values()).flat();
    const regionAggregates = calculateGroupAggregates(regionRows);

    // Add region header (always visible)
    items.push({
      type: "region",
      key: `region-${region}`,
      region,
      aggregates: regionAggregates,
      expanded: expandedRegions.has(region),
    });

    // Only show territories if region is expanded
    if (expandedRegions.has(region)) {
      for (const [territory, territoryRows] of territories.entries()) {
        const territoryAggregates = calculateGroupAggregates(territoryRows);
        const territoryKey = `${region}::${territory}`;

        // Add territory header
        items.push({
          type: "territory",
          key: `territory-${territoryKey}`,
          territory,
          region,
          aggregates: territoryAggregates,
          expanded: expandedTerritories.has(territoryKey),
        });

        // Only show rows if territory is expanded
        if (expandedTerritories.has(territoryKey)) {
          for (const row of territoryRows) {
            items.push({
              type: "row",
              key: row.rowKey,
              row,
            });
          }
        }
      }
    }
  }

  return items;
}
