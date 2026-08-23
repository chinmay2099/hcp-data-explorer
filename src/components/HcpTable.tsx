import {
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  Paper,
  Box,
  Typography,
} from "@mui/material";
import { type HcpRecord } from "../lib/data-generator";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef, useState, useEffect } from "react";

interface HcpTableProps {
  data: HcpRecord[];
}

export function HcpTable({ data }: HcpTableProps) {
  const [domRowCount, setDomRowCount] = useState(0);
  const [lastOperationTime, setLastOperationTime] = useState<number>(0);

  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: data.length,
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
              const row = data[virtualRow.index];
              return (
                <div
                  key={virtualRow.index}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "53px",
                    transform: `translateY(${virtualRow.start}px)`,
                    display: "flex",
                    alignItems: "center",
                    borderBottom: "1px solid",
                    borderColor: "rgba(224, 224, 224, 1)",
                    padding: "0 16px",
                    transition: "background-color 0.2s ease",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(0, 0, 0, 0.04)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <div
                    style={{
                      width: "140px",
                      flexShrink: 0,
                      fontFamily: "monospace",
                      fontSize: "0.875rem",
                      color: "text.secondary",
                      textAlign: "left",
                    }}
                  >
                    {row.id}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                      fontWeight: 500,
                      color: "text.primary",
                      textAlign: "left",
                    }}
                  >
                    {row.name}
                  </div>
                  <div
                    style={{
                      width: "160px",
                      flexShrink: 0,
                      color: "text.secondary",
                      textAlign: "left",
                    }}
                  >
                    {row.specialty || "-"}
                  </div>
                  <div
                    style={{
                      width: "130px",
                      flexShrink: 0,
                      color: "text.primary",
                      textAlign: "left",
                    }}
                  >
                    {row.region}
                  </div>
                  <div
                    style={{
                      width: "160px",
                      flexShrink: 0,
                      color: "text.primary",
                      textAlign: "left",
                    }}
                  >
                    {row.territory}
                  </div>
                  <div
                    style={{
                      width: "90px",
                      flexShrink: 0,
                      fontWeight: 600,
                      color: "primary.main",
                      textAlign: "right",
                    }}
                  >
                    {row.calls}
                  </div>
                  <div
                    style={{
                      width: "90px",
                      flexShrink: 0,
                      color: "text.primary",
                      textAlign: "right",
                    }}
                  >
                    {row.trx}
                  </div>
                  <div
                    style={{
                      width: "90px",
                      flexShrink: 0,
                      color: "text.primary",
                      textAlign: "right",
                    }}
                  >
                    {row.nrx}
                  </div>
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
