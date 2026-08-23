import { type HcpRow } from "../types/hcp";
import { calculateCPI, normalizeCalls } from "../lib/hcp-utils";

interface HcpRowProps {
  row: HcpRow;
}

export function HcpRowComponent({ row }: HcpRowProps) {
  const normalizedCalls = normalizeCalls(row.calls);
  const cpi = calculateCPI(normalizedCalls || 0, row.trx);
  const displayCPI = cpi === null ? "—" : cpi.toFixed(2);
  const displayCalls = normalizedCalls === null ? row.calls : normalizedCalls;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        borderBottom: "1px solid",
        borderColor: "rgba(224, 224, 224, 1)",
        padding: "0 16px",
        transition: "background-color 0.2s ease",
        cursor: "default",
        height: "53px",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.04)";
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
          color: "#666",
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
          color: "#333",
          textAlign: "left",
        }}
      >
        {row.name}
      </div>
      <div
        style={{
          width: "160px",
          flexShrink: 0,
          color: "#666",
          textAlign: "left",
        }}
      >
        {row.specialty || "-"}
      </div>
      <div
        style={{
          width: "130px",
          flexShrink: 0,
          color: "#333",
          textAlign: "left",
        }}
      >
        {row.region}
      </div>
      <div
        style={{
          width: "160px",
          flexShrink: 0,
          color: "#333",
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
          color: "#0B5FA5",
          textAlign: "right",
        }}
      >
        {displayCalls}
      </div>
      <div
        style={{
          width: "90px",
          flexShrink: 0,
          color: "#333",
          textAlign: "right",
        }}
      >
        {row.trx}
      </div>
      <div
        style={{
          width: "90px",
          flexShrink: 0,
          color: "#333",
          textAlign: "right",
        }}
      >
        {row.nrx}
      </div>
      <div
        style={{
          width: "90px",
          flexShrink: 0,
          color: "#666",
          textAlign: "right",
        }}
      >
        {displayCPI}
      </div>
    </div>
  );
}
