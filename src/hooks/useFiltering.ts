import { useState, useMemo } from "react";
import { type HcpRow } from "../types/hcp";
import {
  filterBySearchTerm,
  filterByRegion,
  filterByTerritory,
  getAvailableRegions,
  getAvailableTerritories,
} from "./filtering.utils";

export function useFiltering(data: HcpRow[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedTerritory, setSelectedTerritory] = useState("all");

  const availableRegions = useMemo(
    () => getAvailableRegions(data),
    [data]
  );

  const availableTerritories = useMemo(
    () => getAvailableTerritories(data, selectedRegion),
    [data, selectedRegion]
  );

  const filteredData = useMemo(() => {
    let result = data;

    result = filterBySearchTerm(result, searchTerm);
    result = filterByRegion(result, selectedRegion);
    result = filterByTerritory(result, selectedTerritory);

    return result;
  }, [data, searchTerm, selectedRegion, selectedTerritory]);

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