import { createHash, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { appendContextNoteToMyNotes } from "@/lib/append-context-note";
import { logDocumentIngestAudit } from "@/lib/ingest-audit";
import { insertDocumentIngest, selectTimelineDocumentsForCompany } from "@/lib/db/document-ingest";
import { saveUploadFiles } from "@/lib/upload-file-storage";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const docs = await selectTimelineDocumentsForCompany(params.id);
  return NextResponse.json(docs);
}

function slugForAddress(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "company"
  );
}

async function sha256File(file: File): Promise<string> {
  const buf = Buffer.from(await file.arrayBuffer());
  return createHash("sha256").update(buf).digest("hex");
}

function ingestErrorMessage(e: unknown): string {
  if (!(e instanceof Error)) return "Ingestion failed.";
  const m = e.message;
  if (m.includes("DATABASE_URL must be")) {
    return "Database is not configured (set DATABASE_URL in .env).";
  }
  if (
    m.includes("ECONNREFUSED") ||
    m.includes("ER_ACCESS_DENIED") ||
    m.includes("getaddrinfo ENOTFOUND")
  ) {
    return "Could not connect to MySQL. Check DATABASE_URL and that the server is running.";
  }
  if (m.includes("read-only file system") || m.includes("EROFS")) {
    return "Upload directory is not writable on this host (e.g. read-only deploy).";
  }
  return m;
}

function isYyyyMmDd(v: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(v.trim());
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const companyId = params.id;
  try {
    const form = await request.formData();

    const files = form.getAll("file").filter((e): e is File => e instanceof File && e.size > 0);
    if (files.length === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const primary = files[0]!;
    const hash = await sha256File(primary);
    const extraHashes =
      files.length > 1 ? await Promise.all(files.slice(1).map((f) => sha256File(f))) : [];

    const documentId = `doc-${companyId}-${Date.now()}`;
    const companyName = (form.get("companyName") as string) || companyId;
    const forwardingAddress = `uploads+${slugForAddress(companyName)}@ingest.cerulean.app`;

    const documentTypeName = String(form.get("documentTypeName") ?? "Investor update");
    const temporalType = String(form.get("temporalType") ?? "historical");
    const updateLabel = String(form.get("updateLabel") ?? "").trim();
    const documentDate = String(form.get("documentDate") ?? "");
    const receivedDate = String(form.get("receivedDate") ?? "");
    if (!updateLabel) {
      return NextResponse.json(
        { error: "Update number or label is required." },
        { status: 400 }
      );
    }
    if (!isYyyyMmDd(documentDate) || !isYyyyMmDd(receivedDate)) {
      return NextResponse.json(
        { error: "Document date and received date are required." },
        { status: 400 }
      );
    }
    const language = String(form.get("language") ?? "");
    const originalSender = String(form.get("originalSender") ?? "");
    const howReceived = String(form.get("howReceived") ?? "");
    const provenance = String(form.get("provenance") ?? "");
    const optForensic = String(form.get("optForensic")) === "true";
    const optExternal = String(form.get("optExternal")) === "true";
    const optDigest = String(form.get("optDigest")) === "true";
    const suppressFlags = String(form.get("suppressFlags")) === "true";

    const contextNote = String(form.get("contextNote") ?? "");
    if (contextNote.trim()) {
      await appendContextNoteToMyNotes(companyId, contextNote);
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

    const jobId = `job-${companyId}-${Date.now()}`;
    const ingestFolderId = randomUUID();

    const stored = await saveUploadFiles(companyId, ingestFolderId, files);

    await insertDocumentIngest({
      id: ingestFolderId,
      jobId,
      companyId,
      documentId,
      fileDisplayName: displayName,
      fileCount: files.length,
      totalSizeBytes: totalSize,
      primaryHash: hash,
      extraHashesJson: JSON.stringify(extraHashes),
      documentTypeName,
      temporalType,
      updateLabel,
      documentDate,
      receivedDate,
      language,
      originalSender,
      howReceived,
      provenance,
      optForensic,
      optExternal,
      optDigest,
      suppressFlags,
      storedFilesJson: JSON.stringify(stored),
    });

    return NextResponse.json({
      documentId,
      jobId,
      hash,
      forwardingAddress,
    });
  } catch (e) {
    console.error("[documents POST]", e);
    return NextResponse.json(
      { error: ingestErrorMessage(e) },
      { status: 500 }
    );
  }
}
