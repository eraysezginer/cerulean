export type DisclosureStatus = "Not disclosed" | "Disclosed (Update 11)" | "Disclosed (Update 10)";

export type CapTableEvent = {
  id: string;
  kind: string;
  detail: string;
  date: string;
  disclosure: DisclosureStatus;
  border: "red" | "green";
};

export const kalderCapEvents: CapTableEvent[] = [
  {
    id: "c1",
    kind: "Equity issuance",
    detail: "48,000 shares Class A",
    date: "Nov 14, 2025",
    disclosure: "Not disclosed",
    border: "red",
  },
  {
    id: "c2",
    kind: "Option grant",
    detail: "12,000 shares",
    date: "Oct 3, 2025",
    disclosure: "Not disclosed",
    border: "red",
  },
  {
    id: "c3",
    kind: "Convertible note $340K",
    detail: "",
    date: "Sep 18, 2025",
    disclosure: "Disclosed (Update 11)",
    border: "green",
  },
  {
    id: "c4",
    kind: "New investor addition",
    detail: "",
    date: "Aug 7, 2025",
    disclosure: "Not disclosed",
    border: "red",
  },
  {
    id: "c5",
    kind: "SAFE conversion $180K",
    detail: "",
    date: "Jul 22, 2025",
    disclosure: "Disclosed (Update 10)",
    border: "green",
  },
];

export function getCapTableEventsForCompany(companyId: string): CapTableEvent[] {
  if (companyId === "kalder") return kalderCapEvents;
  return [];
}
