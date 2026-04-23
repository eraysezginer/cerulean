import { readFile } from "node:fs/promises";
import path from "node:path";
import type { StoredFile } from "@/lib/upload-file-storage";

const DEFAULT_MAX_PER = 12 * 1024 * 1024;
const DEFAULT_MAX_TOTAL = 24 * 1024 * 1024;

function maxPerFileBytes(): number {
  const n = Number(process.env.INGEST_AI_MAX_FILE_BYTES);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_MAX_PER;
}

function maxTotalBytes(): number {
  const n = Number(process.env.INGEST_AI_TOTAL_FILE_BYTES);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_MAX_TOTAL;
}

export type MultimodalUserPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } }
  | { type: "file"; file: { filename: string; file_data: string } };

type GatherResult = { parts: MultimodalUserPart[]; textNotes: string[] };

const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp"]);

function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i).toLowerCase() : "";
}

function mimeForFile(originalName: string): string {
  const ext = extOf(originalName);
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".gif") return "image/gif";
  if (ext === ".webp") return "image/webp";
  if (ext === ".txt" || ext === ".eml") return "text/plain; charset=utf-8";
  if (ext === ".docx")
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (ext === ".xlsx")
    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  if (ext === ".msg") return "application/vnd.ms-outlook";
  return "application/octet-stream";
}

/**
 * Reads stored upload files from disk and turns them into OpenRouter multimodal parts.
 * Skips or truncates with notes when over size limits.
 */
export async function readStoredFilesAsMultimodalParts(
  storedFilesJson: string,
  projectRoot: string
): Promise<GatherResult> {
  const textNotes: string[] = [];
  const parts: MultimodalUserPart[] = [];
  let parsed: StoredFile[];
  try {
    parsed = JSON.parse(storedFilesJson) as StoredFile[];
  } catch {
    return { parts: [], textNotes: ["(Invalid storedFilesJson; no files could be loaded.)"] };
  }
  if (!Array.isArray(parsed) || parsed.length === 0) {
    return { parts: [], textNotes: ["(No files on record for this ingest.)"] };
  }

  const maxPer = maxPerFileBytes();
  const maxTotal = maxTotalBytes();
  let total = 0;

  for (const f of parsed) {
    const abs = path.isAbsolute(f.relativePath)
      ? f.relativePath
      : path.join(projectRoot, f.relativePath);
    let buf: Buffer;
    try {
      buf = await readFile(abs);
    } catch {
      textNotes.push(`- Could not read file: ${f.originalName} (${f.relativePath})`);
      continue;
    }
    if (buf.length > maxPer) {
      textNotes.push(
        `- Skipped (too large, max ${maxPer} bytes): ${f.originalName} (${buf.length} bytes)`
      );
      continue;
    }
    if (total + buf.length > maxTotal) {
      textNotes.push(
        `- Skipped (total size cap ${maxTotal} bytes): ${f.originalName}`
      );
      continue;
    }
    total += buf.length;

    const name = f.originalName || path.basename(f.relativePath);
    const ext = extOf(name);
    const mime = mimeForFile(name);
    const dataUrl = `data:${mime};base64,${buf.toString("base64")}`;

    if (ext === ".txt" || ext === ".eml") {
      const t = buf.toString("utf8");
      const cap = 120_000;
      parts.push({
        type: "text",
        text:
          t.length > cap
            ? `--- File: ${name} (text, truncated) ---\n${t.slice(0, cap)}`
            : `--- File: ${name} (text) ---\n${t}`,
      });
      continue;
    }

    if (IMAGE_EXT.has(ext)) {
      parts.push({ type: "image_url", image_url: { url: dataUrl } });
      continue;
    }

    parts.push({
      type: "file",
      file: { filename: name, file_data: dataUrl },
    });
  }

  return { parts, textNotes };
}
