import { NextResponse } from "next/server";
import {
  deleteTimelineDocumentForCompany,
  selectTimelineDocumentsForCompany,
} from "@/lib/db/document-ingest";
import { tryLogDocumentDeleteAudit } from "@/lib/ingest-audit";

export const runtime = "nodejs";

const userId = () => process.env.CERULEAN_USER_ID ?? "lp-investor-1";

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string; documentId: string } }
) {
  const { id: companyId, documentId } = params;
  const docs = await selectTimelineDocumentsForCompany(companyId);
  const doc = docs.find((d) => d.id === documentId);
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ok = tryLogDocumentDeleteAudit({
    action: "delete",
    documentId,
    userId: userId(),
    timestamp: new Date().toISOString(),
    hash: doc.hash,
  });
  if (!ok) {
    return NextResponse.json(
      { error: "Audit log write failed; document kept" },
      { status: 503 }
    );
  }
  const deleted = await deleteTimelineDocumentForCompany(companyId, documentId);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true, flagsRemoved: doc.flagCount });
}
