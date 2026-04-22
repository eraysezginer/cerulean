/**
 * Immutable audit log placeholder — in production this writes to a durable store.
 */
const audit: { ts: number; line: string }[] = [];

export function logDocumentIngestAudit(line: string): void {
  audit.push({ ts: Date.now(), line });
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.info("[ingest:audit]", line);
  }
}
