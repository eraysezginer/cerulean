/** İstemcide (upload ekranı) ve sunucuda paylaşılan pipeline adımları — mysql2 içermez. */

export type PipelineStep = {
  id: string;
  name: string;
  status: "complete" | "processing" | "queued";
  description: string;
};

export const PROCESSING_STEPS_PLACEHOLDER: PipelineStep[] = [
  {
    id: "ingest",
    name: "Ingestion",
    status: "complete",
    description: "File stored and hash verified for the audit log.",
  },
  {
    id: "classify",
    name: "Classification",
    status: "complete",
    description: "Document type applied to the processing chain.",
  },
  {
    id: "baseline",
    name: "Baseline comparison",
    status: "processing",
    description: "Comparing to stored investor updates and stored claims.",
  },
  {
    id: "forensic",
    name: "Forensic analysis",
    status: "queued",
    description: "Waiting in the analysis queue.",
  },
  {
    id: "xref",
    name: "External cross-reference",
    status: "queued",
    description: "Preparing to match claims and public records.",
  },
];
