export type TimelineType =
  | "investor_update"
  | "ppm"
  | "financial"
  | "captable"
  | "pitch_deck"
  | "board_deck"
  | "side_letter"
  | "reference";

export type TimelineDocument = {
  id: string;
  companyId: string;
  label: string;
  type: TimelineType;
  documentDate: string;
  receivedDate: string;
  sequencePosition: number;
  flagCount: number;
  confidenceLevel: "high" | "medium" | "low" | "none";
  hash: string;
  isReference: boolean;
  language: string;
};

/** Flag history / timeline (legacy UI) — not the document matrix */
export type FlagHistoryEvent = {
  id: string;
  label: string;
  detail: string;
  level: string;
  isMaterial?: boolean;
  border: "red" | "amber" | "green" | "neutral";
};

export function getTimelineForCompany(_companyId: string): FlagHistoryEvent[] {
  return [];
}
