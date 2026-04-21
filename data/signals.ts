export type ExternalSeverity = "High" | "Medium" | "Low";

export type ExternalSignal = {
  id: string;
  source: string;
  signalType: string;
  description: string;
  severity: ExternalSeverity;
  ago: string;
  border: "red" | "amber" | "grey";
};

export const kalderExternalSignals: ExternalSignal[] = [
  {
    id: "es1",
    source: "EDGAR",
    signalType: "Form D amendment",
    description:
      "New exempt offering $2.1M — not disclosed in Updates 13 or 14",
    severity: "High",
    ago: "8d ago",
    border: "red",
  },
  {
    id: "es2",
    source: "LinkedIn",
    signalType: "Headcount signal",
    description:
      "6 engineering departures in 90 days — not acknowledged",
    severity: "High",
    ago: "15d ago",
    border: "red",
  },
  {
    id: "es3",
    source: "Crunchbase",
    signalType: "Investor engagement",
    description:
      "Lead investor activity dropped — no new co-investor in 60 days",
    severity: "Medium",
    ago: "22d ago",
    border: "amber",
  },
  {
    id: "es4",
    source: "GitHub",
    signalType: "Commit pattern",
    description:
      "Repository activity down 74% vs 6-month average",
    severity: "Medium",
    ago: "3d ago",
    border: "amber",
  },
  {
    id: "es5",
    source: "UCC",
    signalType: "Lien filing",
    description:
      "New UCC-1 $340K equipment lien — not disclosed",
    severity: "High",
    ago: "31d ago",
    border: "red",
  },
  {
    id: "es6",
    source: "News",
    signalType: "Press absence",
    description: "No press coverage for 5 months",
    severity: "Low",
    ago: "—",
    border: "grey",
  },
];

export function getExternalSignalsForCompany(
  companyId: string
): ExternalSignal[] {
  if (companyId === "kalder") return kalderExternalSignals;
  return kalderExternalSignals.map((s, i) => ({ ...s, id: `${companyId}-${i}` }));
}
