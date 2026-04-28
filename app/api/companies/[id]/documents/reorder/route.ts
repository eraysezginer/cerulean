import { NextResponse } from "next/server";
import { reorderTimelineDocumentsForCompany } from "@/lib/db/document-ingest";

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

  const ok = await reorderTimelineDocumentsForCompany(companyId, documentIds);
  if (!ok) {
    return NextResponse.json({ error: "Document list mismatch" }, { status: 400 });
  }
  return NextResponse.json({ success: true, updatedAt: new Date().toISOString() });
}
