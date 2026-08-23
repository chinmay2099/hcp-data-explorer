import { type HcpRow, type RenderItem } from "../types/hcp";
import { calculateGroupAggregates } from "../lib/hcp-utils";

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

export function flattenGroupedData(
  groupedData: Map<string, Map<string, HcpRow[]>>,
  expandedRegions: Set<string>,
  expandedTerritories: Set<string>,
): RenderItem[] {
  const items: RenderItem[] = [];

  for (const [region, territories] of groupedData.entries()) {
    const regionRows = Array.from(territories.values()).flat();
    const regionAggregates = calculateGroupAggregates(regionRows);

    items.push({
      type: "region",
      key: `region-${region}`,
      region,
      aggregates: regionAggregates,
      expanded: expandedRegions.has(region),
    });

    if (expandedRegions.has(region)) {
      for (const [territory, territoryRows] of territories.entries()) {
        const territoryAggregates = calculateGroupAggregates(territoryRows);
        const territoryKey = `${region}::${territory}`;

        items.push({
          type: "territory",
          key: `territory-${territoryKey}`,
          territory,
          region,
          aggregates: territoryAggregates,
          expanded: expandedTerritories.has(territoryKey),
        });

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
