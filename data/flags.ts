import { getIngestFlagsForCompany, getIngestFlagsForPortfolio } from "@/lib/db/ingest-flags";
import { flagPolarity, type CompanyFlagDetail, type Confidence, type FlagPolarity, type PortfolioFlag } from "@/data/flag-types";

export { flagPolarity };
export type { CompanyFlagDetail, Confidence, FlagPolarity, PortfolioFlag };

const confidenceOrder: Record<Confidence, number> = { High: 0, Medium: 1, Low: 2 };
const polarityOrder: Record<FlagPolarity, number> = { negative: 0, positive: 1 };

/** All AI flags persisted on completed ingests for this company. */
export async function getFlagsForCompany(companyId: string): Promise<CompanyFlagDetail[]> {
  const rows = await getIngestFlagsForCompany(companyId);
  return [...rows].sort((a, b) => {
    const byPolarity = polarityOrder[flagPolarity(a)] - polarityOrder[flagPolarity(b)];
    if (byPolarity !== 0) return byPolarity;
    return confidenceOrder[a.confidence] - confidenceOrder[b.confidence];
  });
}

/** Portfolio-wide, sorted by confidence (High first). */
export async function getPortfolioFlagsSorted(): Promise<PortfolioFlag[]> {
  const rows = await getIngestFlagsForPortfolio();
  return [...rows].sort(
    (a, b) =>
      polarityOrder[a.polarity] - polarityOrder[b.polarity] ||
      confidenceOrder[a.confidence] - confidenceOrder[b.confidence]
  );
}
