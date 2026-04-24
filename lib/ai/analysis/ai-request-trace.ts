import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

/** Set `AI_TRACE=1` in `.env` to log and return request/response summaries (no full base64). */
export function isAiTraceEnabled(): boolean {
  const v = process.env.AI_TRACE?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

function summarizeContentPart(part: unknown): unknown {
  if (typeof part !== "object" || part === null) return part;
  const p = part as Record<string, unknown>;
  if (p.type === "text" && typeof p.text === "string") {
    const t = p.text;
    if (t.length > 12_000) {
      return {
        type: "text",
        text: `${t.slice(0, 12_000)}\n… [truncated, total ${t.length} chars]`,
      };
    }
    return { type: "text", text: t };
  }
  if (p.type === "image_url" && p.image_url && typeof p.image_url === "object") {
    const url = (p.image_url as { url?: string }).url ?? "";
    return {
      type: "image_url",
      image_url: {
        url: url.startsWith("data:") ? `[data URL, ${url.length} chars]` : url,
      },
    };
  }
  if (p.type === "file" && p.file && typeof p.file === "object") {
    const f = p.file as { filename?: string; file_data?: string };
    const fd = f.file_data ?? "";
    return {
      type: "file",
      file: {
        filename: f.filename ?? "(unknown)",
        file_data: fd.startsWith("data:")
          ? `[base64 data URL, ${fd.length} chars]`
          : `[${fd.length} chars]`,
      },
    };
  }
  return part;
}

/** Human-readable request payload for logs / `_trace` (base64 elided). */
export function summarizeMessagesForLog(
  messages: ChatCompletionMessageParam[]
): { role: string; content: unknown }[] {
  return messages.map((m) => {
    if (m.role === "system") {
      return {
        role: "system",
        content: typeof m.content === "string" ? m.content : m.content,
      };
    }
    if (m.role === "user") {
      const c = m.content;
      if (typeof c === "string") {
        return { role: "user", content: c.length > 12_000 ? `${c.slice(0, 12_000)}…` : c };
      }
      if (Array.isArray(c)) {
        return { role: "user", content: c.map(summarizeContentPart) };
      }
    }
    return { role: m.role, content: m.content as unknown };
  });
}

export function logAiAnalyzeTrace(phase: "out" | "in" | "error", data: unknown): void {
  if (!isAiTraceEnabled()) return;
  const line = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  console.log(`[ai/analyze] TRACE ${phase}\n${line}\n---`);
}
