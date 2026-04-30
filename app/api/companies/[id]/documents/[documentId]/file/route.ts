import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import {
  absoluteStoredFilePath,
  selectStoredFileForTimelineDocument,
} from "@/lib/db/document-ingest";

export const runtime = "nodejs";

const contentTypes: Record<string, string> = {
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8",
  ".eml": "message/rfc822",
  ".msg": "application/vnd.ms-outlook",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

export async function GET(
  request: Request,
  { params }: { params: { id: string; documentId: string } }
) {
  const url = new URL(request.url);
  const index = Number(url.searchParams.get("index") ?? "0");
  if (!Number.isInteger(index) || index < 0) {
    return NextResponse.json({ error: "Invalid file index" }, { status: 400 });
  }

  const file = await selectStoredFileForTimelineDocument({
    companyId: params.id,
    documentId: params.documentId,
    index,
  });
  if (!file) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const abs = absoluteStoredFilePath(file);
  if (!abs) {
    return NextResponse.json({ error: "Invalid stored file path" }, { status: 400 });
  }

  const body = await readFile(abs);
  const ext = path.extname(file.originalName).toLowerCase();
  const contentType = contentTypes[ext] ?? "application/octet-stream";
  const disposition = contentType === "application/pdf" || contentType.startsWith("text/")
    ? "inline"
    : "attachment";

  return new NextResponse(body, {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(body.length),
      "Content-Disposition": `${disposition}; filename="${encodeURIComponent(file.originalName)}"`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
