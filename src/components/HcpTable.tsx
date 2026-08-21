import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { type HcpRecord } from "../lib/data-generator";

interface HcpTableProps {
  data: HcpRecord[];
}

export function HcpTable({ data }: HcpTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Specialty</TableCell>
            <TableCell>Region</TableCell>
            <TableCell>Territory</TableCell>
            <TableCell>Calls</TableCell>
            <TableCell>TRx</TableCell>
            <TableCell>NRx</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.id}</TableCell>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.specialty || "-"}</TableCell>
              <TableCell>{row.region}</TableCell>
              <TableCell>{row.territory}</TableCell>
              <TableCell>{row.calls}</TableCell>
              <TableCell>{row.trx}</TableCell>
              <TableCell>{row.nrx}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
