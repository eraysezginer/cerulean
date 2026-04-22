import type { Note } from "@/data/notes";
import { getNotesForCompany } from "@/data/notes";
import { registerNotesForCompany } from "@/lib/notes-registry";

/**
 * Appends a Context-tagged private note, matching My Notes panel structure.
 */
export function appendContextNoteToMyNotes(companyId: string, text: string): void {
  const trimmed = text.trim();
  if (!trimmed) return;

  let notes = getNotesForCompany(companyId);
  if (notes.length === 1 && notes[0].text === "No notes yet for this company.") {
    notes = [];
  }

  const note: Note = {
    id: `ctx-up-${Date.now()}`,
    tag: "Context",
    date: new Date().toISOString().slice(0, 10),
    text: trimmed,
  };
  registerNotesForCompany(companyId, [...notes, note]);
}
