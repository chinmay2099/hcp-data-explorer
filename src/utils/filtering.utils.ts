// Utility: Filtering functions for HCP data
// Provides search, region, and territory filtering with helper functions
// for extracting available filter options from data
import { type HcpRow } from "../types/hcp";

// Filter rows by search term (case-insensitive match on name or ID)
// Returns all rows if search term is empty or whitespace
export function filterBySearchTerm(
  rows: HcpRow[],
  searchTerm: string,
): HcpRow[] {
  if (!searchTerm.trim()) {
    return rows;
  }

  const lowerSearchTerm = searchTerm.toLowerCase();
  return rows.filter(
    (row) =>
      row.name.toLowerCase().includes(lowerSearchTerm) ||
      row.id.toLowerCase().includes(lowerSearchTerm),
  );
}

// Filter rows by region
// Returns all rows if region is "all"
export function filterByRegion(rows: HcpRow[], region: string): HcpRow[] {
  if (region === "all") {
    return rows;
  }
  return rows.filter((row) => row.region === region);
}

// Filter rows by territory
// Returns all rows if territory is "all"
export function filterByTerritory(rows: HcpRow[], territory: string): HcpRow[] {
  if (territory === "all") {
    return rows;
  }
  return rows.filter((row) => row.territory === territory);
}

// Extract unique regions from data (sorted)
// Used to populate region filter dropdown
export function getAvailableRegions(rows: HcpRow[]): string[] {
  const regions = new Set(rows.map((row) => row.region));
  return Array.from(regions).sort();
}

// Extract unique territories from data (sorted)
// If region is "all", returns all territories
// If region is selected, returns only territories in that region (cascading filter)
export function getAvailableTerritories(
  rows: HcpRow[],
  selectedRegion: string,
): string[] {
  if (selectedRegion === "all") {
    const territories = new Set(rows.map((row) => row.territory));
    return Array.from(territories).sort();
  }
  const territories = new Set(
    rows
      .filter((row) => row.region === selectedRegion)
      .map((row) => row.territory),
  );
  return Array.from(territories).sort();
}
