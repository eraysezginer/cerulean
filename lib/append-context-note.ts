import { insertContextNote } from "@/lib/db/note";

/**
 * Appends a Context-tagged private note in MySQL.
 */
export async function appendContextNoteToMyNotes(companyId: string, text: string): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return;
  await insertContextNote(companyId, trimmed);
}
