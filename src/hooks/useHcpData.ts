// Hook: Loads and manages HCP data
// Generates mock data on mount and adds unique row keys
import { useEffect, useState } from "react";
import { generateRows } from "../utils/data-generator";
import { enrichWithRowKey } from "../utils/hcp-utils";
import { type HcpRow } from "../types/hcp";

export function useHcpData() {
  // State: loaded data and loading status
  const [data, setData] = useState<HcpRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Effect: generate mock data on component mount
  // Creates 50,000 rows with random data and unique row keys
  useEffect(() => {
    const rows = generateRows(42, 50000);
    const enrichedRows = enrichWithRowKey(rows);
    setData(enrichedRows);
    setLoading(false);
  }, []);

  return { data, loading };
}
