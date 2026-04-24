import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { buildIngestMonitoringContextBlock } from "./ingest-monitoring-context";
import type { MultimodalUserPart } from "./read-stored-upload-files";
import type { DocumentIngestRow } from "@/lib/db/document-ingest";

const SYSTEM = `You are Cerulean’s portfolio monitoring assistant.

You receive:
1) A block of precomputed context (metrics, baselines, and instructions) — in English.
2) The uploaded file(s) as multimodal input (PDF, image, or text as provided).

You do NOT receive any pre-existing "flags" from the system. You must output NEW monitoring
flags derived only from the document(s) and the precomputed context.

Language: All human-readable strings in your JSON response MUST be in **English** — including
"analysis", and every flag’s "signalType", "description", and "sourceAnchor".
Use "confidence" exactly as: High | Medium | Low.

Return a single JSON object (no markdown code fences) with this exact shape:
{
  "flags": [
    {
      "confidence": "High" | "Medium" | "Low",
      "signalType": "short label in English",
      "description": "plain-language explanation for the investment team (English)",
      "sourceAnchor": "section, page, or quote location (English)"
    }
  ],
  "analysis": "Concise English narrative: key risks, consistency notes, follow-up. Empty string if not needed."
}

Do not invent specific financial numbers, dates, or names that are not present in the files or
context. If the file is unreadable or not applicable, return an empty flags array and explain in
English in the "analysis" field.`;

export function buildDocumentIngestAiMessages(input: {
  row: DocumentIngestRow;
  companyName: string;
  multimodalParts: MultimodalUserPart[];
  sizeNotes: string[];
}): ChatCompletionMessageParam[] {
  const ctx = buildIngestMonitoringContextBlock({
    companyName: input.companyName,
    fileDisplayName: input.row.fileDisplayName,
    documentTypeName: input.row.documentTypeName,
    temporalType: input.row.temporalType,
    updateLabel: input.row.updateLabel,
    documentDate: input.row.documentDate,
    receivedDate: input.row.receivedDate,
    language: input.row.language,
    primaryHash: input.row.primaryHash,
    processingSeconds: input.row.processingSeconds,
  });

  const notes =
    input.sizeNotes.length > 0
      ? `\n## Server notes (files)\n${input.sizeNotes.join("\n")}\n`
      : "";

  const introText = `${ctx}${notes}\n## Uploaded file(s)\nThe following part(s) contain the document content (binary formats as data per OpenRouter).`;

  const userContent: MultimodalUserPart[] = [
    { type: "text", text: introText },
    ...input.multimodalParts,
    {
      type: "text",
      text: "Respond with the JSON object only, following the system schema. All free-text fields in English. Confidence must be High, Medium, or Low.",
    },
  ];

  // OpenAI SDK message types do not list OpenRouter `file` content parts; runtime shape matches API.
  const userMsg = { role: "user" as const, content: userContent } as unknown;
  return [ { role: "system", content: SYSTEM }, userMsg] as ChatCompletionMessageParam[];
}

/** Stable ids for flags persisted in DB. */
export function assignFlagIds(companyId: string, jobId: string, n: number): string[] {
  return Array.from({ length: n }, (_, i) => `ai-${companyId}-${jobId}-${i}`);
}
