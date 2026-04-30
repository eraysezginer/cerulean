export type Confidence = "High" | "Medium" | "Low";
export type FlagPolarity = "negative" | "positive";

export type PortfolioFlag = {
  id: string;
  companyId: string;
  companyName: string;
  signalType: string;
  confidence: Confidence;
  polarity: FlagPolarity;
  updateRef: string;
  signalCount?: number;
  dotColor: "red" | "amber" | "grey" | "green";
};

export type CompanyFlagDetail = {
  id: string;
  confidence: Confidence;
  /** Existing model output did not include this; missing values are treated as negative. */
  polarity?: FlagPolarity;
  signalType: string;
  description: string;
  sourceAnchor: string;
  informedByNote?: boolean;
  source?: {
    companyName?: string;
    fileDisplayName: string;
    updateLabel: string;
    documentTypeName: string;
    documentDate: string;
    receivedDate: string;
    jobId: string;
    documentId: string;
    primaryHash: string;
    aiAnalysisAt?: string | null;
    aiAnalysisModel?: string | null;
  };
};

export function flagPolarity(flag: Pick<CompanyFlagDetail, "polarity">): FlagPolarity {
  return flag.polarity === "positive" ? "positive" : "negative";
}
