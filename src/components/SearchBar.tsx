// Component: Search input field
// Filters data by matching text in name or ID fields (case-insensitive)
import { TextField, Box } from "@mui/material";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function SearchBar({ searchTerm, onSearchChange }: SearchBarProps) {
  return (
    <Box sx={{ width: 300 }}>
      <TextField
        fullWidth
        size="small"
        placeholder="Search by name or ID..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        variant="outlined"
      />
    </Box>
  );
}