import { NextResponse } from "next/server";
import { getTimelineDocuments, setTimelineDocuments } from "@/lib/timeline-store";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const companyId = params.id;
  let body: { documentIds?: string[] };
  try {
    body = (await request.json()) as { documentIds?: string[] };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { documentIds } = body;
  if (!Array.isArray(documentIds) || documentIds.length === 0) {
    return NextResponse.json({ error: "documentIds array required" }, { status: 400 });
  }

  const current = getTimelineDocuments(companyId);
  const byId = new Map(current.map((d) => [d.id, d]));
  if (byId.size !== current.length) {
    return NextResponse.json({ error: "Internal state" }, { status: 500 });
  }

  const next: typeof current = [];
  for (const id of documentIds) {
    const d = byId.get(id);
    if (!d) {
      return NextResponse.json({ error: `Unknown document: ${id}` }, { status: 400 });
    }
    byId.delete(id);
  }
  if (byId.size > 0) {
    return NextResponse.json({ error: "Document list mismatch" }, { status: 400 });
  }

  for (let i = 0; i < documentIds.length; i++) {
    const d = current.find((x) => x.id === documentIds[i])!;
    next.push({ ...d, sequencePosition: i });
  }
  setTimelineDocuments(companyId, next);
  return NextResponse.json({ success: true, updatedAt: new Date().toISOString() });
}
