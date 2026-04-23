import type { CompanyFlagDetail, Confidence } from "@/data/flags";

function normalizeConfidence(v: unknown): Confidence {
  const s = String(v ?? "").toLowerCase();
  if (s === "high" || s === "h") return "High";
  if (s === "low" || s === "l") return "Low";
  return "Medium";
}

function stripFences(raw: string): string {
  let t = raw.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/i, "");
    t = t.replace(/\s*```\s*$/i, "");
  }
  return t.trim();
}

export type ParsedIngestAiResult = {
  flags: CompanyFlagDetail[];
  analysis: string;
};

export function parseIngestAiJson(
  content: string,
  assignIds: (n: number) => string[]
): ParsedIngestAiResult {
  const text = stripFences(content);
  let obj: unknown;
  try {
    obj = JSON.parse(text) as unknown;
  } catch {
    return { flags: [], analysis: text.slice(0, 8_000) || "Model did not return valid JSON." };
  }

  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
    return { flags: [], analysis: "Invalid JSON shape (expected object)." };
  }

  const rec = obj as Record<string, unknown>;
  const analysis = typeof rec.analysis === "string" ? rec.analysis : "";
  const rawFlags = rec.flags;

  if (!Array.isArray(rawFlags)) {
    return { flags: [], analysis: analysis || "Missing flags array in JSON." };
  }

  const ids = assignIds(rawFlags.length);
  const flags: CompanyFlagDetail[] = rawFlags.map((item, i) => {
    const o = (typeof item === "object" && item !== null ? item : {}) as Record<string, unknown>;
    return {
      id: ids[i] ?? `flag-${i}`,
      confidence: normalizeConfidence(o.confidence),
      signalType: String(o.signalType ?? "Signal").slice(0, 200),
      description: String(o.description ?? "").slice(0, 4_000),
      sourceAnchor: String(o.sourceAnchor ?? "—").slice(0, 500),
    };
  });

  return { flags, analysis };
}
