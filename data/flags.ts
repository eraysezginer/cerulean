import { getIngestFlagsForCompany, getIngestFlagsForPortfolio } from "@/lib/db/ingest-flags";

export type Confidence = "High" | "Medium" | "Low";

export type PortfolioFlag = {
  id: string;
  companyId: string;
  companyName: string;
  signalType: string;
  confidence: Confidence;
  updateRef: string;
  signalCount?: number;
  dotColor: "red" | "amber" | "grey";
};

export type CompanyFlagDetail = {
  id: string;
  confidence: Confidence;
  signalType: string;
  description: string;
  sourceAnchor: string;
  informedByNote?: boolean;
};

const confidenceOrder: Record<Confidence, number> = { High: 0, Medium: 1, Low: 2 };

/** All AI flags persisted on completed ingests for this company. */
export async function getFlagsForCompany(companyId: string): Promise<CompanyFlagDetail[]> {
  const rows = await getIngestFlagsForCompany(companyId);
  return [...rows].sort((a, b) => confidenceOrder[a.confidence] - confidenceOrder[b.confidence]);
}

/** Portfolio-wide, sorted by confidence (High first). */
export async function getPortfolioFlagsSorted(): Promise<PortfolioFlag[]> {
  const rows = await getIngestFlagsForPortfolio();
  return [...rows].sort(
    (a, b) => confidenceOrder[a.confidence] - confidenceOrder[b.confidence]
  );
}
