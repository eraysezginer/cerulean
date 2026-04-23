/**
 * Precomputed context sent with uploaded files to the model (English in prompt).
 * Replace or extend with real metrics, RAG output, and baseline comparisons.
 */
export type IngestMonitoringContextInput = {
  companyName: string;
  fileDisplayName: string;
  documentTypeName: string;
  temporalType: string;
  updateLabel: string;
  documentDate: string;
  receivedDate: string;
  language: string;
  primaryHash: string;
  processingSeconds: number | null;
};

export function buildIngestMonitoringContextBlock(
  input: IngestMonitoringContextInput
): string {
  return `## Precomputed context (Cerulean)

- Company: ${input.companyName}
- Primary file label: ${input.fileDisplayName}
- Document type: ${input.documentTypeName}
- Temporal role: ${input.temporalType}
- Update label: ${input.updateLabel || "—"}
- Document date: ${input.documentDate || "—"}
- Received date: ${input.receivedDate || "—"}
- Language: ${input.language}
- SHA-256 (primary file): ${input.primaryHash}
- Processing time (s): ${input.processingSeconds ?? "—"}

## Placeholder metrics and checks (edit in ingest-monitoring-context.ts)

- Baseline: compare this document to the rolling investor baseline for disclosure depth.
- Check for unexplained date shifts vs prior public milestones (if any are cited in the text).
- Note tone and structure drift from the last update in the same sequence.

## Task instructions

You will also receive the raw uploaded file(s) below. Do not assume any flags or signals were
pre-computed. Derive everything from the document(s) and this context.`;
}
