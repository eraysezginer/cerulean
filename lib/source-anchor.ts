function normalizeWhitespace(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

function normalizeForPdfSearch(input: string): string {
  // Keep apostrophes so contractions like "I'm" stay searchable.
  return normalizeWhitespace(input.replace(/[^a-zA-Z0-9\s'’]/g, " "));
}

export function sourceAnchorSearchTerm(sourceAnchor: string): string | null {
  const raw = normalizeForPdfSearch(sourceAnchor);
  if (!raw || raw === "—") return null;
  const lower = raw.toLowerCase();
  if (lower === "n/a" || lower === "none" || lower === "no source anchor returned by the model.") {
    return null;
  }

  const words = raw.split(" ").filter(Boolean);
  if (words.length === 0) return null;
  // Keep the full anchor text for matching; line-wrap handling is done in viewer logic.
  return words.join(" ").slice(0, 600);
}

export function withSourceAnchorSearch(url: string, sourceAnchor: string): string {
  const term = sourceAnchorSearchTerm(sourceAnchor);
  if (!term) return url;
  return `${url}#search=${encodeURIComponent(term)}`;
}
