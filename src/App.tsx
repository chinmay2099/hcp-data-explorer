// Component: Main application component
// Orchestrates data loading, filtering, sorting, editing, and theming
// Coordinates all hooks and components to build the HCP data explorer
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  ThemeProvider,
  createTheme,
  Button,
} from "@mui/material";
import { HcpTable } from "./components/HcpTable";
import { useHcpData } from "./hooks/useHcpData";
import { useFiltering } from "./hooks/useFiltering";
import { useSorting } from "./hooks/useSorting";
import { useTenantTheme } from "./hooks/useTenantTheme";
import { useEditHistory } from "./hooks/useEditHistory";
import { SearchBar } from "./components/SearchBar";
import { RegionFilter } from "./components/RegionFilter";
import { TerritoryFilter } from "./components/TerritoryFilter";
import { TenantSelector } from "./components/TenantSelector";
import { useState, useEffect } from "react";
import { type HcpRow } from "./types/hcp";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";

function App() {
  // Load initial data on mount
  const { data: initialData, loading } = useHcpData();
  // Local state for editable data (tracks changes)
  const [data, setData] = useState<HcpRow[]>([]);
  // Tenant theming
  const { theme, currentTenant, setTenant, availableTenants } =
    useTenantTheme();

  // Sync initial data to local state when loaded
  useEffect(() => {
    if (initialData.length > 0) {
      setData(initialData);
    }
  }, [initialData]);

  // Create MUI theme from tenant configuration
  const muiTheme = createTheme({
    palette: {
      primary: {
        main: theme.primary,
        contrastText: theme.onPrimary,
      },
      background: {
        default: theme.background,
        paper: theme.surface,
      },
      text: {
        primary: theme.text,
      },
    },
    shape: {
      borderRadius: theme.radius,
    },
    components: {
      MuiTableCell: {
        styleOverrides: {
          head: {
            backgroundColor: theme.primary,
            color: theme.onPrimary,
          },
        },
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
  });

  // Filtering: search, region, territory
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

  // Sorting: apply to filtered data
  const { sortState, sortedData, toggleSort } = useSorting(filteredData);

  // Edit history: undo/redo functionality
  const { addCommand, undo, redo, canUndo, canRedo } = useEditHistory();

  // Handle data update from table edit
  // Updates local state and records edit command for undo/redo
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

  // Undo: revert last edit using history hook
  const handleUndo = () => {
    setData((prev) => undo(prev));
  };

  // Redo: re-apply next edit using history hook
  const handleRedo = () => {
    setData((prev) => redo(prev));
  };

  // Loading state
  if (loading) {
    return (
      <ThemeProvider theme={muiTheme}>
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
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={muiTheme} key={currentTenant}>
      <Container maxWidth={false} sx={{ px: 3, bgcolor: theme.background }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4">{theme.appName}</Typography>
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
          <TenantSelector
            currentTenant={currentTenant}
            availableTenants={availableTenants}
            onTenantChange={setTenant}
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
    </ThemeProvider>
  );
}

export default App;
