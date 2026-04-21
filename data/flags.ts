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

export const portfolioFlags: PortfolioFlag[] = [
  {
    id: "pf1",
    companyId: "kalder",
    companyName: "Kalder Inc.",
    signalType: "Omission detection",
    confidence: "High",
    updateRef: "Update 14",
    dotColor: "red",
  },
  {
    id: "pf2",
    companyId: "allhere",
    companyName: "AllHere Education",
    signalType: "Metric count drop",
    confidence: "High",
    updateRef: "Update 9",
    dotColor: "red",
  },
  {
    id: "pf3",
    companyId: "delve",
    companyName: "Delve Systems",
    signalType: "AI-washing signal",
    confidence: "Medium",
    updateRef: "Update 6",
    dotColor: "amber",
  },
  {
    id: "pf4",
    companyId: "frank",
    companyName: "Frank Fintech",
    signalType: "Contradiction detected",
    confidence: "High",
    updateRef: "Update 11",
    dotColor: "red",
  },
  {
    id: "pf5",
    companyId: "nate",
    companyName: "Nate Inc.",
    signalType: "Silence — 28 days",
    confidence: "Medium",
    updateRef: "—",
    dotColor: "amber",
  },
  {
    id: "pf6",
    companyId: "atlas",
    companyName: "Atlas Platform",
    signalType: "Authorship shift",
    confidence: "Low",
    updateRef: "Update 8",
    dotColor: "grey",
  },
  {
    id: "pf7",
    companyId: "nova",
    companyName: "Nova Analytics",
    signalType: "Cadence variance",
    confidence: "Medium",
    updateRef: "Update 4",
    dotColor: "amber",
  },
  {
    id: "pf8",
    companyId: "lightspeed",
    companyName: "Lightspeed App",
    signalType: "Disclosure depth",
    confidence: "Low",
    updateRef: "Update 2",
    dotColor: "grey",
  },
];

export const kalderFlagDetails: CompanyFlagDetail[] = [
  {
    id: "k1",
    confidence: "High",
    signalType: "Omission detection",
    description:
      "Revenue topic cluster absent from Updates 11–14. Present in every prior update for 14 months.",
    sourceAnchor: "Update 14, para 2",
    informedByNote: true,
  },
  {
    id: "k2",
    confidence: "High",
    signalType: "Metric count drop",
    description:
      "Disclosure depth: 12 metrics (U1) → 3 metrics (U14) over 4 updates without acknowledgment.",
    sourceAnchor: "Update 13, metrics section",
  },
  {
    id: "k3",
    confidence: "High",
    signalType: "Milestone drift",
    description:
      "'Q3 FDA approval' → Q4 (U9) → H1 2027 (U12) → absent entirely (U14). Not acknowledged.",
    sourceAnchor: "Updates 9, 12, 14",
  },
  {
    id: "k4",
    confidence: "Medium",
    signalType: "Authorship shift",
    description:
      "Syntactic distance 2.8σ from founder baseline — corroborating signal only, not primary flag.",
    sourceAnchor: "Update 14 (full text)",
  },
  {
    id: "k5",
    confidence: "Medium",
    signalType: "Cadence anomaly",
    description:
      "34-day gap before Update 14. Historical: 28–30 days, Tuesdays 09:00–10:30 AM.",
    sourceAnchor: "Metadata",
  },
];

export function getFlagsForCompany(companyId: string): CompanyFlagDetail[] {
  if (companyId === "kalder") return kalderFlagDetails;
  return kalderFlagDetails.map((f, i) => ({
    ...f,
    id: `${companyId}-${i}`,
    informedByNote: false,
  }));
}

export function getPortfolioFlagsSorted(): PortfolioFlag[] {
  const order: Record<Confidence, number> = { High: 0, Medium: 1, Low: 2 };
  return [...portfolioFlags].sort(
    (a, b) => order[a.confidence] - order[b.confidence]
  );
}
