// Component: Main table component with virtual scrolling for performance
// Handles grouping, sorting, editing, and virtualization of 50k+ rows
// Uses @tanstack/react-virtual for efficient DOM rendering
import {
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  Paper,
  Box,
  Typography,
  Tooltip,
  useTheme,
} from "@mui/material";
import { type HcpRow } from "../types/hcp";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef, useState, useEffect } from "react";
import { useGrouping } from "../hooks/useGrouping";
import { GroupRow } from "./GroupRow";
import { HcpRowComponent } from "./HcpRow";
import { type SortState, type SortColumn } from "../utils/sorting.utils";
import { validateCalls } from "../utils/mock-validator";

interface HcpTableProps {
  data: HcpRow[];
  autoExpand?: boolean;
  sortState: SortState;
  onSortToggle: (column: SortColumn) => void;
  onDataUpdate: (
    updatedData: HcpRow[],
    rowKey: string,
    field: keyof HcpRow,
    oldValue: number | string,
    newValue: number,
  ) => void;
}

export function HcpTable({
  data,
  autoExpand = false,
  sortState,
  onSortToggle,
  onDataUpdate,
}: HcpTableProps) {
  // Performance metrics: DOM row count and operation time
  const [domRowCount, setDomRowCount] = useState(0);
  const [lastOperationTime, setLastOperationTime] = useState<number>(0);
  // Track rows with pending edits to prevent concurrent edits
  const [pendingEdits, setPendingEdits] = useState<Set<string>>(new Set());
  const theme = useTheme();

  const parentRef = useRef<HTMLDivElement>(null);

  // Group data for hierarchical display
  const { renderItems, toggleRegion, toggleTerritory } = useGrouping(
    data,
    autoExpand,
  );

  // Handle cell edit with validation
  const handleEdit = async (
    rowKey: string,
    field: keyof HcpRow,
    value: number,
  ) => {
    setPendingEdits((prev) => new Set(prev).add(rowKey));

    try {
      if (field === "calls") {
        await validateCalls(value);
      }

      const row = data.find((r) => r.rowKey === rowKey);
      if (!row) return;

      const oldValue = row[field];
      if (oldValue === null) return;

      const updatedData = data.map((r) =>
        r.rowKey === rowKey ? { ...r, [field]: value } : r,
      );

      onDataUpdate(updatedData, rowKey, field, oldValue, value);
    } finally {
      setPendingEdits((prev) => {
        const next = new Set(prev);
        next.delete(rowKey);
        return next;
      });
    }
  };

  // Virtual scrolling configuration
  // Only renders visible rows + overscan buffer for performance
  const virtualizer = useVirtualizer({
    count: renderItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 53, // Fixed row height
    overscan: 5, // Render 5 extra rows above/below viewport
  });

  const virtualItems = virtualizer.getVirtualItems();

  // Track performance metrics
  useEffect(() => {
    const startTime = performance.now();

    const virtualRows = virtualizer.getVirtualItems();
    setDomRowCount(virtualRows.length);

    const endTime = performance.now();
    setLastOperationTime(endTime - startTime);
  }, [virtualItems.length]);

  // Get sort indicator icon based on sort state
  const getSortIndicator = (column: SortColumn) => {
    if (sortState.column !== column) {
      return (
        <Typography
          component="span"
          sx={{
            fontSize: "0.9rem",
            opacity: 0.55,
            lineHeight: 1,
          }}
        >
          ↕
        </Typography>
      );
    }

    return (
      <Typography
        component="span"
        sx={{
          fontSize: "1rem",
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        {sortState.direction === "asc" ? "↑" : "↓"}
      </Typography>
    );
  };

  const handleSortClick = (column: SortColumn) => {
    onSortToggle(column);
  };

  // Styles for sortable headers
  const sortableHeaderSx = {
    textAlign: "left",
    cursor: "pointer",
    userSelect: "none",
    transition: "background-color 0.15s ease",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.12)",
    },
  };

  const sortableNumericHeaderSx = {
    ...sortableHeaderSx,
    textAlign: "right",
  };

  const sortHeaderContent = (label: string, column: SortColumn) => (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 0.75,
      }}
    >
      <span>{label}</span>
      <Box
        component="span"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: "16px",
        }}
      >
        {getSortIndicator(column)}
      </Box>
    </Box>
  );

  return (
    <Box>
      <Paper
        sx={{
          width: "100%",
          overflow: "hidden",
          boxShadow: 3,
          borderRadius: 2,
          bgcolor: theme.palette.background.paper,
        }}
      >
        <TableContainer
          sx={{
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <TableHead
            sx={{
              bgcolor: theme.palette.primary.main,
              width: "100%",
              display: "table",
              "& .MuiTableCell-head": {
                color: theme.palette.primary.contrastText,
                fontWeight: 600,
                fontSize: "0.875rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                userSelect: "none",
                whiteSpace: "nowrap",
              },
            }}
          >
            <TableRow>
              <TableCell sx={{ width: "140px", textAlign: "left" }}>
                ID
              </TableCell>

              <Tooltip title="Click to sort by Name" arrow>
                <TableCell
                  sx={{
                    ...sortableHeaderSx,
                    width: "auto",
                  }}
                  onClick={() => handleSortClick("name")}
                >
                  {sortHeaderContent("Name", "name")}
                </TableCell>
              </Tooltip>

              <TableCell sx={{ width: "160px", textAlign: "left" }}>
                Specialty
              </TableCell>

              <TableCell sx={{ width: "130px", textAlign: "left" }}>
                Region
              </TableCell>

              <TableCell sx={{ width: "160px", textAlign: "left" }}>
                Territory
              </TableCell>

              <Tooltip title="Click to sort by Calls" arrow>
                <TableCell
                  sx={{
                    ...sortableNumericHeaderSx,
                    width: "90px",
                  }}
                  onClick={() => handleSortClick("calls")}
                >
                  {sortHeaderContent("Calls", "calls")}
                </TableCell>
              </Tooltip>

              <Tooltip title="Click to sort by TRx" arrow>
                <TableCell
                  sx={{
                    ...sortableNumericHeaderSx,
                    width: "90px",
                  }}
                  onClick={() => handleSortClick("trx")}
                >
                  {sortHeaderContent("TRx", "trx")}
                </TableCell>
              </Tooltip>

              <Tooltip title="Click to sort by NRx" arrow>
                <TableCell
                  sx={{
                    ...sortableNumericHeaderSx,
                    width: "90px",
                  }}
                  onClick={() => handleSortClick("nrx")}
                >
                  {sortHeaderContent("NRx", "nrx")}
                </TableCell>
              </Tooltip>

              <Tooltip title="Click to sort by CPI" arrow>
                <TableCell
                  sx={{
                    ...sortableNumericHeaderSx,
                    width: "90px",
                  }}
                  onClick={() => handleSortClick("cpi")}
                >
                  {sortHeaderContent("CPI", "cpi")}
                </TableCell>
              </Tooltip>
            </TableRow>
          </TableHead>
        </TableContainer>

        <div
          ref={parentRef}
          style={{
            height: "400px",
            overflow: "auto",
          }}
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualItems.map((virtualRow) => {
              const item = renderItems[virtualRow.index];

              return (
                <div
                  key={item.key}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "53px",
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {item.type === "region" && (
                    <GroupRow
                      item={item}
                      onToggle={() => toggleRegion(item.region)}
                      level={0}
                    />
                  )}

                  {item.type === "territory" && (
                    <GroupRow
                      item={item}
                      onToggle={() =>
                        toggleTerritory(item.region, item.territory)
                      }
                      level={1}
                    />
                  )}

                  {item.type === "row" && (
                    <HcpRowComponent
                      row={item.row}
                      onEdit={handleEdit}
                      pendingEdits={pendingEdits}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Paper>

      <Box
        sx={{
          mt: 2,
          p: 2,
          bgcolor: "background.paper",
          border: 1,
          borderColor: "divider",
          borderRadius: 2,
          boxShadow: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", gap: 3 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Rows in DOM:</strong> {domRowCount}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            <strong>Last operation:</strong> {lastOperationTime.toFixed(2)} ms
          </Typography>
        </Box>

        <Typography
          variant="caption"
          sx={{
            color: "success.main",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <span>●</span> Virtualized
        </Typography>
      </Box>
    </Box>
  );
}
