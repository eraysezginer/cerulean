import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { appendContextNoteToMyNotes } from "@/lib/append-context-note";
import { logDocumentIngestAudit } from "@/lib/ingest-audit";
import { getTimelineDocuments } from "@/lib/timeline-store";
import { createJob } from "@/lib/upload-jobs";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const docs = getTimelineDocuments(params.id);
  return NextResponse.json(docs);
}

function slugForAddress(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "company";
}

async function sha256File(file: File): Promise<string> {
  const buf = Buffer.from(await file.arrayBuffer());
  return createHash("sha256").update(buf).digest("hex");
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const companyId = params.id;
  const form = await request.formData();

  const files = form.getAll("file").filter((e): e is File => e instanceof File && e.size > 0);
  if (files.length === 0) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const primary = files[0];
  const hash = await sha256File(primary);
  const extraHashes =
    files.length > 1 ? await Promise.all(files.slice(1).map((f) => sha256File(f))) : [];

  const documentId = `doc-${companyId}-${Date.now()}`;
  const companyName = (form.get("companyName") as string) || companyId;
  const forwardingAddress = `uploads+${slugForAddress(companyName)}@ingest.cerulean.app`;

  const documentTypeName = String(form.get("documentTypeName") ?? "Investor update");
  const temporalType = String(form.get("temporalType") ?? "historical") as
    | "in-sequence"
    | "historical"
    | "reference";

  const updateLabel = String(form.get("updateLabel") ?? "");
  const documentDate = String(form.get("documentDate") ?? "");
  const suppressFlags = String(form.get("suppressFlags")) === "true";

  const contextNote = String(form.get("contextNote") ?? "");
  if (contextNote.trim()) {
    appendContextNoteToMyNotes(companyId, contextNote);
  }

  logDocumentIngestAudit(
    JSON.stringify({
      documentId,
      companyId,
      hash,
      extraHashes,
      fileNames: files.map((f) => f.name),
      documentTypeName,
      temporalType,
      at: new Date().toISOString(),
    })
  );

  const totalSize = files.reduce((a, f) => a + f.size, 0);
  const displayName =
    files.length === 1 ? primary.name : `${primary.name} + ${files.length - 1} more`;

  const { jobId } = createJob({
    companyId,
    fileName: displayName,
    fileSize: totalSize,
    hash,
    documentId,
    updateLabel,
    documentDate,
    documentTypeName,
    temporalType,
    suppressFlags,
  });

  return NextResponse.json({
    documentId,
    jobId,
    hash,
    forwardingAddress,
  });
}
