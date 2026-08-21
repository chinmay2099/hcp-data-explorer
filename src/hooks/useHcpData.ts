import { useEffect, useState } from "react";
import { generateRows, type HcpRecord } from "../lib/data-generator";

export function useHcpData() {
  const [data, setData] = useState<HcpRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const rows = generateRows(42, 50000);
    setData(rows);
    setLoading(false);
  }, []);

  return { data, loading };
}
