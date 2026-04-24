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

## Task instructions

Analyze the updates according to the parameters given in the documents`;
}
