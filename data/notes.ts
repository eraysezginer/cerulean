import { selectNotesForCompany } from "@/lib/db/note";

export type NoteTag = "Commitment" | "Concern" | "Market" | "Context";

export type Note = {
  id: string;
  tag: NoteTag;
  date: string;
  text: string;
  usedInAnalysis?: boolean;
};

function isNoteTag(t: string): t is NoteTag {
  return t === "Commitment" || t === "Concern" || t === "Market" || t === "Context";
}

export async function getNotesForCompany(companyId: string): Promise<Note[]> {
  const dbRows = await selectNotesForCompany(companyId);
  const mapped: Note[] = dbRows.map((n) => ({
    id: n.id,
    tag: isNoteTag(n.tag) ? n.tag : "Context",
    date: n.date,
    text: n.text,
  }));
  return mapped;
}
