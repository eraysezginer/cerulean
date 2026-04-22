import { NextResponse } from "next/server";
import { tryLogDocumentDeleteAudit } from "@/lib/ingest-audit";
import { getTimelineDocuments, setTimelineDocuments } from "@/lib/timeline-store";

export const runtime = "nodejs";

const userId = () => process.env.CERULEAN_USER_ID ?? "lp-investor-1";

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string; documentId: string } }
) {
  const { id: companyId, documentId } = params;
  const list = getTimelineDocuments(companyId);
  const doc = list.find((d) => d.id === documentId);
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

  const flagsRemoved = doc.flagCount;
  const filtered = list.filter((d) => d.id !== documentId);
  const reindexed = filtered.map((d, i) => ({ ...d, sequencePosition: i }));
  setTimelineDocuments(companyId, reindexed);

  return NextResponse.json({ success: true, flagsRemoved });
}
