import { type HcpRecord } from "../utils/data-generator";

export interface HcpRow extends HcpRecord {
  rowKey: string;
}

export type RenderItem =
  | {
      type: "region";
      key: string;
      region: string;
      aggregates: GroupAggregates;
      expanded: boolean;
    }
  | {
      type: "territory";
      key: string;
      territory: string;
      region: string;
      aggregates: GroupAggregates;
      expanded: boolean;
    }
  | {
      type: "row";
      key: string;
      row: HcpRow;
    };

export interface GroupAggregates {
  totalCalls: number;
  totalTRx: number;
  totalNRx: number;
  hcpCount: number;
  cpi: number | null;
}
