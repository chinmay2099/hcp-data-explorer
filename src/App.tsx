import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Button,
} from "@mui/material";
import { HcpTable } from "./components/HcpTable";
import { useHcpData } from "./hooks/useHcpData";
import { useFiltering } from "./hooks/useFiltering";
import { useSorting } from "./hooks/useSorting";
import { useEditHistory } from "./hooks/useEditHistory";
import { SearchBar } from "./components/SearchBar";
import { RegionFilter } from "./components/RegionFilter";
import { TerritoryFilter } from "./components/TerritoryFilter";
import { useState, useEffect } from "react";
import { type HcpRow } from "./types/hcp";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";

function App() {
  const { data: initialData, loading } = useHcpData();
  const [data, setData] = useState<HcpRow[]>([]);

  useEffect(() => {
    if (initialData.length > 0) {
      setData(initialData);
    }
  }, [initialData]);

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

  const { addCommand, undo, redo, canUndo, canRedo } = useEditHistory();

  const handleDataUpdate = (
    updatedData: HcpRow[],
    rowKey: string,
    field: keyof HcpRow,
    oldValue: number | string,
    newValue: number,
  ) => {
    setData(updatedData);
    addCommand({ rowKey, field, oldValue, newValue });
  };

  const handleUndo = () => {
    setData((prev) => undo(prev));
  };

  const handleRedo = () => {
    setData((prev) => redo(prev));
  };

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
        <Button
          variant="outlined"
          size="small"
          onClick={handleUndo}
          disabled={!canUndo}
          startIcon={<UndoIcon />}
        >
          Undo
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={handleRedo}
          disabled={!canRedo}
          startIcon={<RedoIcon />}
        >
          Redo
        </Button>
      </Box>
      <HcpTable
        data={sortedData}
        autoExpand={true}
        sortState={sortState}
        onSortToggle={toggleSort}
        onDataUpdate={handleDataUpdate}
      />
    </Container>
  );
}

export default App;
