import { Box, Typography } from "@mui/material";
import { type RenderItem } from "../types/hcp";

interface GroupRowProps {
  item: Extract<RenderItem, { type: "region" | "territory" }>;
  onToggle: () => void;
  level: number;
}

export function GroupRow({ item, onToggle, level }: GroupRowProps) {
  const isRegion = item.type === "region";
  const displayName = isRegion ? item.region : item.territory;
  const paddingLeft = level * 2;

  const formatCPI = (cpi: number | null): string => {
    if (cpi === null) return "—";
    return cpi.toFixed(2);
  };

  return (
    <Box
      onClick={onToggle}
      sx={{
        bgcolor: isRegion ? "primary.main" : "grey.100",
        color: isRegion ? "primary.contrastText" : "text.primary",
        height: "53px",
        px: 2,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 1,
        "&:hover": {
          bgcolor: isRegion ? "primary.dark" : "grey.200",
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
