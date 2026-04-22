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

export type DeleteAuditPayload = {
  action: "delete";
  documentId: string;
  userId: string;
  timestamp: string;
  hash: string;
};

let deleteAuditSimulateFailure = false;

/** Test hook only — not used in production UI */
export function setDeleteAuditSimulateFailure(v: boolean): void {
  deleteAuditSimulateFailure = v;
}

/**
 * Deletion is blocked unless this write succeeds.
 */
export function tryLogDocumentDeleteAudit(payload: DeleteAuditPayload): boolean {
  if (deleteAuditSimulateFailure) {
    return false;
  }
  audit.push({ ts: Date.now(), line: JSON.stringify(payload) });
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.info("[delete:audit]", payload);
  }
  return true;
}
