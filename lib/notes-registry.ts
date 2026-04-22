import type { Note } from "@/data/notes";

const byCompany = new Map<string, Note[]>();

export function registerNotesForCompany(companyId: string, notes: Note[]): void {
  byCompany.set(companyId, notes);
}

export function getRegisteredNotes(companyId: string): Note[] | undefined {
  return byCompany.get(companyId);
}
