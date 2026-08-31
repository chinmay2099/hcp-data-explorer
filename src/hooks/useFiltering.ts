// Hook: Manages filtering logic for HCP data
// Filters by search term, region, and territory with cascading dependencies
import { useState, useMemo } from "react";
import { type HcpRow } from "../types/hcp";
import {
  filterBySearchTerm,
  filterByRegion,
  filterByTerritory,
  getAvailableRegions,
  getAvailableTerritories,
} from "../utils/filtering.utils";

export function useFiltering(data: HcpRow[]) {
  // Filter state: search term, region, territory selections
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedTerritory, setSelectedTerritory] = useState("all");

  // Computed: unique regions available in the data
  const availableRegions = useMemo(() => getAvailableRegions(data), [data]);

  // Computed: territories available for selected region
  // Territory options depend on region selection (cascading filter)
  const availableTerritories = useMemo(
    () => getAvailableTerritories(data, selectedRegion),
    [data, selectedRegion],
  );

  // Computed: filtered data applying all filters in sequence
  // Chain: search → region → territory
  const filteredData = useMemo(() => {
    let result = data;

    result = filterBySearchTerm(result, searchTerm);
    result = filterByRegion(result, selectedRegion);
    result = filterByTerritory(result, selectedTerritory);

    return result;
  }, [data, searchTerm, selectedRegion, selectedTerritory]);

  // Handler: when region changes, reset territory to "all"
  // Prevents invalid territory-region combinations
  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setSelectedTerritory("all");
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedRegion,
    setSelectedRegion: handleRegionChange,
    selectedTerritory,
    setSelectedTerritory,
    availableRegions,
    availableTerritories,
    filteredData,
  };
}
