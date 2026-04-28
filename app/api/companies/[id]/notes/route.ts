import { NextResponse } from "next/server";
import type { NoteTag } from "@/data/notes";
import { insertNote } from "@/lib/db/note";

export const runtime = "nodejs";

function isNoteTag(tag: unknown): tag is NoteTag {
  return (
    tag === "Commitment" ||
    tag === "Concern" ||
    tag === "Market" ||
    tag === "Context"
  );
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = (await request.json()) as { tag?: unknown; text?: unknown };
    const text = typeof body.text === "string" ? body.text.trim() : "";
    const tag = isNoteTag(body.tag) ? body.tag : "Context";

    if (!text) {
      return NextResponse.json({ error: "Note text is required" }, { status: 400 });
    }

    const note = await insertNote({ companyId: params.id, tag, text });
    return NextResponse.json({ note }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Unable to save note" }, { status: 500 });
  }
}
