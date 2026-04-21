import type { Confidence } from "./flags";

export type EvidencePayload = {
  flagId: string;
  companyName: string;
  updateLabel: string;
  paragraph: string;
  timestamp: string;
  confidence: Confidence;
  flaggedExcerpt: string;
  annotation: string;
  historical: { update: string; date: string; quote: string }[];
  noteSection?: {
    tag: string;
    date: string;
    text: string;
    badge: string;
  };
  corroborating: { name: string; detail: string }[];
  footer: { sourceHash: string; noteIds: string; sessionId: string };
};

const defaultEvidence: EvidencePayload = {
  flagId: "k1",
  companyName: "Kalder Inc.",
  updateLabel: "Update 14",
  paragraph: "para 2",
  timestamp: "2025-11-12 09:14 UTC",
  confidence: "High",
  flaggedExcerpt:
    "Operational highlights this quarter focused on pipeline enrollment and site activation. Team expansion in clinical operations continues.",
  annotation:
    "Prior updates (U1–U13) contained a dedicated revenue narrative block; this section is absent with no cross-reference.",
  historical: [
    {
      update: "U12",
      date: "Aug 2025",
      quote:
        "Revenue recognition remains aligned with prior guidance; MRR expansion tracked in appendix B.",
    },
    {
      update: "U10",
      date: "Jun 2025",
      quote:
        "Revenue topic: subscription and milestone components summarized with YoY comparison.",
    },
    {
      update: "U8",
      date: "Apr 2025",
      quote:
        "Revenue cluster present with segment breakdown and reconciliation to audited figures.",
    },
  ],
  noteSection: {
    tag: "Concern",
    date: "Nov 1, 2025",
    text: "Asked whether revenue block would return next cycle — pattern now diverging from historical baseline.",
    badge: "Your note lowered flag threshold",
  },
  corroborating: [
    {
      name: "Metric count drop",
      detail: "Disclosure depth reduced in parallel window.",
    },
    {
      name: "Cadence anomaly",
      detail: "34-day gap before this update vs 28–30 day history.",
    },
    {
      name: "Milestone drift",
      detail: "Timeline language shifted across adjacent updates.",
    },
  ],
  footer: {
    sourceHash: "sha256:e4b2c8…9f1a",
    noteIds: "note-7f2a, note-8c11",
    sessionId: "sess-a91b-44c2",
  },
};

export function getEvidenceForFlag(flagId: string): EvidencePayload {
  return { ...defaultEvidence, flagId };
}
