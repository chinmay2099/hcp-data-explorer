import {
  Container,
  Typography,
  Box,
  CircularProgress,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { HcpTable } from "./components/HcpTable";
import { useHcpData } from "./hooks/useHcpData";
import { useFiltering } from "./hooks/useFiltering";
import { useSorting } from "./hooks/useSorting";
import { useTenantTheme } from "./hooks/useTenantTheme";
import { SearchBar } from "./components/SearchBar";
import { RegionFilter } from "./components/RegionFilter";
import { TerritoryFilter } from "./components/TerritoryFilter";
import { TenantSelector } from "./components/TenantSelector";

function App() {
  const { data, loading } = useHcpData();
  const { theme, currentTenant, setTenant, availableTenants } =
    useTenantTheme();

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
        </Box>
        <HcpTable
          data={sortedData}
          autoExpand={true}
          sortState={sortState}
          onSortToggle={toggleSort}
        />
      </Container>
    </ThemeProvider>
  );
}

export default App;
