export type TimelineRow = {
  id: string;
  label: string;
  detail: string;
  level: string;
  border: "red" | "amber" | "green" | "neutral";
  isMaterial?: boolean;
};

export const kalderTimeline: TimelineRow[] = [
  {
    id: "t1",
    label: "U7 Apr 2025",
    detail: "Metric count: 12→9",
    level: "Low signal",
    border: "green",
  },
  {
    id: "t2",
    label: "U9 Jun 2025",
    detail: "Milestone drift: Q3→Q4",
    level: "Low",
    border: "green",
  },
  {
    id: "t3",
    label: "U10 Jul 2025",
    detail: "Cadence break 34 days",
    level: "Medium",
    border: "amber",
  },
  {
    id: "t4",
    label: "U11 Feb 2025",
    detail: "Revenue cluster ABSENT — CONVERGENCE",
    level: "High",
    border: "red",
  },
  {
    id: "t5",
    label: "U12 Mar 2025",
    detail: "Authorship shift + metric depth 6",
    level: "High",
    border: "red",
  },
  {
    id: "t6",
    label: "U14 Nov 2025",
    detail: "5-signal convergence",
    level: "High",
    border: "red",
  },
  {
    id: "t7",
    label: "— Feb 2026",
    detail: "SEC enforcement action filed",
    level: "MATERIAL EVENT",
    border: "red",
    isMaterial: true,
  },
];

export function getTimelineForCompany(companyId: string): TimelineRow[] {
  if (companyId === "kalder") return kalderTimeline;
  return [];
}
