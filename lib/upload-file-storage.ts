import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export type StoredFile = {
  relativePath: string;
  originalName: string;
  size: number;
};

function safeFileName(name: string): string {
  const t = name.replace(/[/\\?%*:|"<>]/g, "_").trim();
  return t.slice(0, 200) || "file";
}

/**
 * Persists raw upload bytes under data/storage/uploads/{companyId}/{ingestId}/.
 * Returns paths relative to project root (for DB / audit).
 */
export async function saveUploadFiles(
  companyId: string,
  ingestId: string,
  files: File[]
): Promise<StoredFile[]> {
  const out: StoredFile[] = [];
  const baseDir = path.join(process.cwd(), "data", "storage", "uploads", companyId, ingestId);
  await mkdir(baseDir, { recursive: true });

  for (const f of files) {
    const name = safeFileName(f.name);
    const abs = path.join(baseDir, name);
    const buf = Buffer.from(await f.arrayBuffer());
    await writeFile(abs, buf);
    const rel = path.join("data", "storage", "uploads", companyId, ingestId, name);
    out.push({ relativePath: rel, originalName: f.name, size: f.size });
  }
  return out;
}
