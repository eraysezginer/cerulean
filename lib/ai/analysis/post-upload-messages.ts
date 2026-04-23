import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const SYSTEM = `You are Cerulean’s portfolio monitoring assistant. You only use the structured data provided by the user. Do not invent financial numbers, dates, or claims that are not implied by the context. If information is missing, say so briefly.`;

export type PostUploadPromptInput = {
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
  /** JSON string of flag array or null */
  flagsJson: string | null;
};

function formatFlagsBlock(flagsJson: string | null): string {
  if (!flagsJson?.trim()) {
    return "(No flags were attached to this ingest run.)";
  }
  try {
    const arr = JSON.parse(flagsJson) as Array<{
      signalType?: string;
      description?: string;
      confidence?: string;
      sourceAnchor?: string;
    }>;
    if (!Array.isArray(arr) || arr.length === 0) {
      return "(Empty flags list.)";
    }
    return arr
      .map((f, i) => {
        const parts = [
          `${i + 1}.`,
          f.confidence ? `[${f.confidence}]` : "",
          f.signalType ?? "Signal",
          "—",
          f.description ?? "",
          f.sourceAnchor ? `(anchor: ${f.sourceAnchor})` : "",
        ];
        return parts.filter(Boolean).join(" ");
      })
      .join("\n");
  } catch {
    return flagsJson.slice(0, 8000);
  }
}

/** Yükleme sonrası analiz isteği için sohbet mesajları (Türkçe çıktı istenir). */
export function buildPostUploadDocumentMessages(
  input: PostUploadPromptInput
): ChatCompletionMessageParam[] {
  const flagsBlock = formatFlagsBlock(input.flagsJson);
  const user = `Company: ${input.companyName}
File: ${input.fileDisplayName}
Document type: ${input.documentTypeName}
Temporal role: ${input.temporalType}
Label: ${input.updateLabel || "—"}
Document date: ${input.documentDate || "—"}
Received date: ${input.receivedDate || "—"}
Language: ${input.language}
Processing time (s): ${input.processingSeconds ?? "—"}
SHA-256 (primary file): ${input.primaryHash}

Flags / signals generated for this document:
${flagsBlock}

Task: Write a concise analysis for the investment team: key risks, consistency notes, and suggested follow-up monitoring. Use clear headings and bullet points. Respond in Turkish.`;

  return [
    { role: "system", content: SYSTEM },
    { role: "user", content: user },
  ];
}
