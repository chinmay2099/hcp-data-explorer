// Component: Renders region or territory group header rows
// Displays expand/collapse toggle and aggregate statistics
// Different styling for regions (primary color) vs territories (grey)
import { Box, Typography, useTheme } from "@mui/material";
import { type RenderItem } from "../types/hcp";

interface GroupRowProps {
  item: Extract<RenderItem, { type: "region" | "territory" }>;
  onToggle: () => void;
  level: number;
}

export function GroupRow({ item, onToggle, level }: GroupRowProps) {
  const theme = useTheme();
  const isRegion = item.type === "region";
  const displayName = isRegion ? item.region : item.territory;
  const paddingLeft = level * 2; // Indent based on hierarchy level

  const formatCPI = (cpi: number | null): string => {
    if (cpi === null) return "—";
    return cpi.toFixed(2);
  };

  return (
    <Box
      onClick={onToggle}
      sx={{
        bgcolor: isRegion ? theme.palette.primary.main : "grey.100",
        color: isRegion ? theme.palette.primary.contrastText : "text.primary",
        height: "53px",
        px: 2,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 1,
        "&:hover": {
          bgcolor: isRegion ? theme.palette.primary.dark : "grey.200",
          opacity: 0.9,
        },
      }}
    >
      <Typography
        sx={{
          pl: paddingLeft,
          fontWeight: 600,
          fontSize: isRegion ? "1rem" : "0.875rem",
          minWidth: "200px",
        }}
      >
        {item.expanded ? "▼" : "▶"} {displayName}
      </Typography>
      <Typography sx={{ ml: 2, fontSize: "0.875rem" }}>
        Calls: {item.aggregates.totalCalls.toLocaleString()}
      </Typography>
      <Typography sx={{ ml: 2, fontSize: "0.875rem" }}>
        TRx: {item.aggregates.totalTRx.toLocaleString()}
      </Typography>
      <Typography sx={{ ml: 2, fontSize: "0.875rem" }}>
        NRx: {item.aggregates.totalNRx.toLocaleString()}
      </Typography>
      <Typography sx={{ ml: 2, fontSize: "0.875rem" }}>
        HCPs: {item.aggregates.hcpCount.toLocaleString()}
      </Typography>
      <Typography sx={{ ml: 2, fontSize: "0.875rem" }}>
        CPI: {formatCPI(item.aggregates.cpi)}
      </Typography>
    </Box>
  );
}
