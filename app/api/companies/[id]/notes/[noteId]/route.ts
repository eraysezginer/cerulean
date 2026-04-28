import { NextResponse } from "next/server";
import { deleteNoteForCompany } from "@/lib/db/note";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string; noteId: string } }
) {
  try {
    const deleted = await deleteNoteForCompany(params.id, params.noteId);
    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Unable to delete note" }, { status: 500 });
  }
}
