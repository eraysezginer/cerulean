function normalizeWhitespace(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

export function sourceAnchorSearchTerm(sourceAnchor: string): string | null {
  const raw = normalizeWhitespace(sourceAnchor);
  if (!raw || raw === "—") return null;
  const lower = raw.toLowerCase();
  if (lower === "n/a" || lower === "none" || lower === "no source anchor returned by the model.") {
    return null;
  }

  const firstChunk = raw.split(/[.;!?]\s+/)[0] ?? raw;
  const normalized = normalizeWhitespace(firstChunk);
  if (!normalized) return null;
  return normalized.slice(0, 180);
}

export function withSourceAnchorSearch(url: string, sourceAnchor: string): string {
  const term = sourceAnchorSearchTerm(sourceAnchor);
  if (!term) return url;
  return `${url}#search=${encodeURIComponent(term)}&phrase=true`;
}
