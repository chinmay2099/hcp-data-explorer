import { Container, Typography, Box, CircularProgress } from "@mui/material";
import { HcpTable } from "./components/HcpTable";
import { useHcpData } from "./hooks/useHcpData";
import { useFiltering } from "./hooks/useFiltering";
import { useSorting } from "./hooks/useSorting";
import { SearchBar } from "./components/SearchBar";
import { RegionFilter } from "./components/RegionFilter";
import { TerritoryFilter } from "./components/TerritoryFilter";

function App() {
  const { data, loading } = useHcpData();
  const {
    searchTerm,
    setSearchTerm,
    selectedRegion,
    setSelectedRegion,
    selectedTerritory,
    setSelectedTerritory,
    availableRegions,
    availableTerritories,
    filteredData,
  } = useFiltering(data);

  const { sortState, sortedData, toggleSort } = useSorting(filteredData);

  if (loading) {
    return (
      <div className="loading-container">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <CircularProgress />
          <Typography>Loading data...</Typography>
        </Box>
      </div>
    );
  }

  return (
    <Container maxWidth={false} sx={{ px: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">HCP Data Explorer</Typography>
        <Typography variant="body1">
          Total Records: {data.length.toLocaleString()} | Showing:{" "}
          {sortedData.length.toLocaleString()}
        </Typography>
      </Box>
      <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        <RegionFilter
          selectedRegion={selectedRegion}
          availableRegions={availableRegions}
          onRegionChange={setSelectedRegion}
        />
        <TerritoryFilter
          selectedTerritory={selectedTerritory}
          availableTerritories={availableTerritories}
          onTerritoryChange={setSelectedTerritory}
          disabled={selectedRegion === "all"}
        />
      </Box>
      <HcpTable
        data={sortedData}
        autoExpand={true}
        sortState={sortState}
        onSortToggle={toggleSort}
      />
    </Container>
  );
}

export default App;
