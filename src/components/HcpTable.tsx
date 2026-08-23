import {
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  Paper,
  Box,
  Typography,
} from "@mui/material";
import { type HcpRow } from "../types/hcp";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef, useState, useEffect } from "react";
import { useGrouping } from "../hooks/useGrouping";
import { GroupRow } from "./GroupRow";
import { HcpRowComponent } from "./HcpRow";

interface HcpTableProps {
  data: HcpRow[];
  autoExpand?: boolean;
}

export function HcpTable({ data, autoExpand = false }: HcpTableProps) {
  const [domRowCount, setDomRowCount] = useState(0);
  const [lastOperationTime, setLastOperationTime] = useState<number>(0);

  const parentRef = useRef<HTMLDivElement>(null);

  const { renderItems, toggleRegion, toggleTerritory } = useGrouping(
    data,
    autoExpand,
  );

  const virtualizer = useVirtualizer({
    count: renderItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 53,
    overscan: 5,
  });

  useEffect(() => {
    const startTime = performance.now();
    const virtualRows = virtualizer.getVirtualItems();
    setDomRowCount(virtualRows.length);
    const endTime = performance.now();
    setLastOperationTime(endTime - startTime);
  }, [virtualizer]);

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <Box>
      <Paper
        sx={{
          width: "100%",
          overflow: "hidden",
          boxShadow: 3,
          borderRadius: 2,
        }}
      >
        <TableContainer
          sx={{
            maxHeight: "70vh",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <TableHead
            sx={{
              bgcolor: "primary.main",
              width: "100%",
              display: "table",
              "& .MuiTableCell-head": {
                color: "primary.contrastText",
                fontWeight: 600,
                fontSize: "0.875rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              },
            }}
          >
            <TableRow>
              <TableCell sx={{ width: "140px", textAlign: "left" }}>
                ID
              </TableCell>
              <TableCell sx={{ flex: 1, textAlign: "left" }}>Name</TableCell>
              <TableCell sx={{ width: "160px", textAlign: "left" }}>
                Specialty
              </TableCell>
              <TableCell sx={{ width: "130px", textAlign: "left" }}>
                Region
              </TableCell>
              <TableCell sx={{ width: "160px", textAlign: "left" }}>
                Territory
              </TableCell>
              <TableCell sx={{ width: "90px", textAlign: "right" }}>
                Calls
              </TableCell>
              <TableCell sx={{ width: "90px", textAlign: "right" }}>
                TRx
              </TableCell>
              <TableCell sx={{ width: "90px", textAlign: "right" }}>
                NRx
              </TableCell>
              <TableCell sx={{ width: "90px", textAlign: "right" }}>
                CPI
              </TableCell>
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
                  {item.type === "row" && <HcpRowComponent row={item.row} />}
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
