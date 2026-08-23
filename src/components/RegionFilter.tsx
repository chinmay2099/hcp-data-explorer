import { FormControl, InputLabel, Select, MenuItem, Box } from "@mui/material";

interface RegionFilterProps {
  selectedRegion: string;
  availableRegions: string[];
  onRegionChange: (region: string) => void;
}

export function RegionFilter({
  selectedRegion,
  availableRegions,
  onRegionChange,
}: RegionFilterProps) {
  return (
    <Box sx={{ minWidth: 150 }}>
      <FormControl fullWidth size="small">
        <InputLabel>Region</InputLabel>
        <Select
          value={selectedRegion}
          label="Region"
          onChange={(e) => onRegionChange(e.target.value)}
        >
          <MenuItem value="all">All Regions</MenuItem>
          {availableRegions.map((region) => (
            <MenuItem key={region} value={region}>
              {region}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}