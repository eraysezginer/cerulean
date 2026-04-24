/**
 * Document timeline for portfolio companies (mock + types).
 * GET /api/companies/[id]/documents returns these for kalder, seeded in timeline-store.
 */

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

const H = (n: string) => `a1b2c3d4e5f6${n}7890abcdef1234567890abcdef1234567890abcdef12`.padEnd(64, "0").slice(0, 64);

function confidenceFromFlags(n: number): "high" | "medium" | "low" | "none" {
  if (n === 0) return "none";
  if (n >= 3) return "high";
  if (n >= 1) return "medium";
  return "low";
}

const kalder = "kalder";

/**
 * 16 items: PPM, U1–U14, financial. Flag counts per spec.
 */
export const KALDER_DOCUMENTS: TimelineDocument[] = [
  {
    id: "kalder-tl-ppm",
    companyId: kalder,
    label: "PPM 2023",
    type: "ppm",
    documentDate: "2024-04-12",
    receivedDate: "2024-04-14",
    sequencePosition: 0,
    flagCount: 0,
    confidenceLevel: "none",
    hash: H("01"),
    isReference: true,
    language: "English",
  },
  ...(
    [
      { pos: 1, u: 1, d: "2024-05-20", f: 0 },
      { pos: 2, u: 2, d: "2024-06-18", f: 0 },
      { pos: 3, u: 3, d: "2024-07-22", f: 0 },
      { pos: 4, u: 4, d: "2024-08-19", f: 0 },
      { pos: 5, u: 5, d: "2024-09-16", f: 0 },
      { pos: 6, u: 6, d: "2024-10-21", f: 0 },
      { pos: 7, u: 7, d: "2024-11-18", f: 1 },
      { pos: 8, u: 8, d: "2024-12-16", f: 0 },
      { pos: 9, u: 9, d: "2025-01-20", f: 1 },
      { pos: 10, u: 10, d: "2025-02-17", f: 1 },
      { pos: 11, u: 11, d: "2025-03-24", f: 3 },
      { pos: 12, u: 12, d: "2025-04-21", f: 2 },
      { pos: 13, u: 13, d: "2025-05-19", f: 2 },
      { pos: 14, u: 14, d: "2025-06-23", f: 5 },
    ] as const
  ).map(({ pos, u, d, f }) => ({
    id: `kalder-tl-u${u}`,
    companyId: kalder,
    label: `Update ${u}`,
    type: "investor_update" as const,
    documentDate: d,
    receivedDate: d,
    sequencePosition: pos,
    flagCount: f,
    confidenceLevel: confidenceFromFlags(f),
    hash: H(String(u + 10)),
    isReference: false,
    language: "English",
  })),
  {
    id: "kalder-tl-fin",
    companyId: kalder,
    label: "FY24 Financials",
    type: "financial",
    documentDate: "2025-08-15",
    receivedDate: "2025-08-20",
    sequencePosition: 15,
    flagCount: 0,
    confidenceLevel: "none",
    hash: H("ff"),
    isReference: true,
    language: "English",
  },
];

export function getSeedDocumentsForCompany(companyId: string): TimelineDocument[] {
  if (companyId === "kalder") {
    return KALDER_DOCUMENTS.map((d) => ({ ...d }));
  }
  return [];
}

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
