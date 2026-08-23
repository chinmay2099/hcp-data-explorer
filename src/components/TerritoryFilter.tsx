import { FormControl, InputLabel, Select, MenuItem, Box } from "@mui/material";

interface TerritoryFilterProps {
  selectedTerritory: string;
  availableTerritories: string[];
  onTerritoryChange: (territory: string) => void;
  disabled?: boolean;
}

export function TerritoryFilter({
  selectedTerritory,
  availableTerritories,
  onTerritoryChange,
  disabled = false,
}: TerritoryFilterProps) {
  return (
    <Box sx={{ minWidth: 200 }}>
      <FormControl fullWidth size="small" disabled={disabled}>
        <InputLabel>Territory</InputLabel>
        <Select
          value={selectedTerritory}
          label="Territory"
          onChange={(e) => onTerritoryChange(e.target.value)}
        >
          <MenuItem value="all">All Territories</MenuItem>
          {availableTerritories.map((territory) => (
            <MenuItem key={territory} value={territory}>
              {territory}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}