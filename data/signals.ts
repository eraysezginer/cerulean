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

export function getExternalSignalsForCompany(
  companyId: string
): ExternalSignal[] {
  void companyId;
  return [];
}
