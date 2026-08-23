import { type HcpRow } from "../types/hcp";

export function filterBySearchTerm(
  rows: HcpRow[],
  searchTerm: string
): HcpRow[] {
  if (!searchTerm.trim()) {
    return rows;
  }

  const lowerSearchTerm = searchTerm.toLowerCase();
  return rows.filter(
    (row) =>
      row.name.toLowerCase().includes(lowerSearchTerm) ||
      row.id.toLowerCase().includes(lowerSearchTerm)
  );
}

export function filterByRegion(
  rows: HcpRow[],
  region: string
): HcpRow[] {
  if (region === "all") {
    return rows;
  }
  return rows.filter((row) => row.region === region);
}

export function filterByTerritory(
  rows: HcpRow[],
  territory: string
): HcpRow[] {
  if (territory === "all") {
    return rows;
  }
  return rows.filter((row) => row.territory === territory);
}

export function getAvailableRegions(rows: HcpRow[]): string[] {
  const regions = new Set(rows.map((row) => row.region));
  return Array.from(regions).sort();
}

export function getAvailableTerritories(
  rows: HcpRow[],
  selectedRegion: string
): string[] {
  if (selectedRegion === "all") {
    const territories = new Set(rows.map((row) => row.territory));
    return Array.from(territories).sort();
  }
  const territories = new Set(
    rows.filter((row) => row.region === selectedRegion).map((row) => row.territory)
  );
  return Array.from(territories).sort();
}