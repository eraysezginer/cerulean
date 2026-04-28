export type DisclosureStatus = "Not disclosed" | "Disclosed (Update 11)" | "Disclosed (Update 10)";

export type CapTableEvent = {
  id: string;
  kind: string;
  detail: string;
  date: string;
  disclosure: DisclosureStatus;
  border: "red" | "green";
};

export function getCapTableEventsForCompany(companyId: string): CapTableEvent[] {
  void companyId;
  return [];
}
