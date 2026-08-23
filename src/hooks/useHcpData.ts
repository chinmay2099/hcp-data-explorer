import { useEffect, useState } from "react";
import { generateRows } from "../lib/data-generator";
import { enrichWithRowKey } from "../lib/hcp-utils";
import { type HcpRow } from "../types/hcp";

export function useHcpData() {
  const [data, setData] = useState<HcpRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const rows = generateRows(42, 50000);
    const enrichedRows = enrichWithRowKey(rows);
    setData(enrichedRows);
    setLoading(false);
  }, []);

  return { data, loading };
}
