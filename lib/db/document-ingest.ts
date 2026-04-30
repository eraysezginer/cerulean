import { rm } from "node:fs/promises";
import path from "node:path";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { CompanyFlagDetail } from "@/data/flags";
import type { TimelineDocument, TimelineType } from "@/data/timeline";
import getPool from "./pool";

export type DocumentIngestRow = RowDataPacket & {
  id: string;
  jobId: string;
  companyId: string;
  documentId: string;
  fileDisplayName: string;
  fileCount: number;
  totalSizeBytes: number;
  primaryHash: string;
  extraHashesJson: string;
  documentTypeName: string;
  temporalType: string;
  updateLabel: string;
  documentDate: string;
  receivedDate: string;
  language: string;
  originalSender: string;
  howReceived: string;
  provenance: string;
  optForensic: number | boolean;
  optExternal: number | boolean;
  optDigest: number | boolean;
  suppressFlags: number | boolean;
  sequencePosition: number | null;
  status: string;
  processingSeconds: number | null;
  jobStartedAt: Date;
  storedFilesJson: string;
  flagsJson: string | null;
  /** Present after `001_document_ingest_ai_analysis` migration + analysis run */
  aiAnalysisText?: string | null;
  aiAnalysisModel?: string | null;
  aiAnalysisAt?: Date | null;
};

export type NewDocumentIngest = {
  id: string;
  jobId: string;
  companyId: string;
  documentId: string;
  fileDisplayName: string;
  fileCount: number;
  totalSizeBytes: number;
  primaryHash: string;
  extraHashesJson: string;
  documentTypeName: string;
  temporalType: string;
  updateLabel: string;
  documentDate: string;
  receivedDate: string;
  language: string;
  originalSender: string;
  howReceived: string;
  provenance: string;
  optForensic: boolean;
  optExternal: boolean;
  optDigest: boolean;
  suppressFlags: boolean;
  storedFilesJson: string;
};

type TimelineIngestRow = RowDataPacket & {
  id: string;
  documentId: string;
  companyId: string;
  fileDisplayName: string;
  documentTypeName: string;
  temporalType: string;
  updateLabel: string;
  documentDate: string;
  receivedDate: string;
  language: string;
  suppressFlags: number | boolean;
  sequencePosition: number | null;
  primaryHash: string;
  storedFilesJson: string;
  flagsJson: string | null;
  createdAt: Date;
};

function toBool(v: number | boolean): boolean {
  return v === true || v === 1;
}

function parseFlagsArray(s: string | null): CompanyFlagDetail[] {
  if (s == null || !String(s).trim() || s === "[]") return [];
  try {
    const arr = JSON.parse(s) as CompanyFlagDetail[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function confidenceFromFlags(flags: CompanyFlagDetail[]): TimelineDocument["confidenceLevel"] {
  if (flags.length === 0) return "none";
  if (flags.some((f) => f.confidence === "High")) return "high";
  if (flags.some((f) => f.confidence === "Medium")) return "medium";
  return "low";
}

function timelineTypeFromDocumentType(name: string): TimelineType {
  const s = name.toLowerCase();
  if (s.includes("ppm") || s.includes("offering")) return "ppm";
  if (s.includes("financial")) return "financial";
  if (s.includes("cap table") || s.includes("captable")) return "captable";
  if (s.includes("pitch")) return "pitch_deck";
  if (s.includes("board")) return "board_deck";
  if (s.includes("side letter")) return "side_letter";
  if (s.includes("reference")) return "reference";
  return "investor_update";
}

function rowToTimelineDocument(row: TimelineIngestRow, fallbackPosition: number): TimelineDocument {
  const flags = toBool(row.suppressFlags) ? [] : parseFlagsArray(row.flagsJson);
  const type = timelineTypeFromDocumentType(row.documentTypeName);
  return {
    id: row.documentId,
    companyId: row.companyId,
    label: row.updateLabel || row.fileDisplayName || row.documentTypeName,
    type,
    documentDate: row.documentDate || row.createdAt.toISOString(),
    receivedDate: row.receivedDate || row.createdAt.toISOString(),
    sequencePosition: row.sequencePosition ?? fallbackPosition,
    flagCount: flags.length,
    confidenceLevel: confidenceFromFlags(flags),
    hash: row.primaryHash,
    isReference: row.temporalType === "reference" || type === "reference" || type === "ppm",
    language: row.language || "—",
  };
}

async function ensureTimelineSequenceColumn(): Promise<void> {
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT 1
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'DocumentIngest'
       AND COLUMN_NAME = 'sequencePosition'
     LIMIT 1`
  );
  if (rows.length > 0) return;

  await pool.execute(
    "ALTER TABLE `DocumentIngest` ADD COLUMN `sequencePosition` INTEGER NULL AFTER `suppressFlags`"
  );
  await pool.execute(
    `UPDATE \`DocumentIngest\` d
     JOIN (
       SELECT
         \`id\`,
         ROW_NUMBER() OVER (
           PARTITION BY \`companyId\`
           ORDER BY
             COALESCE(NULLIF(\`documentDate\`, ''), DATE_FORMAT(\`createdAt\`, '%Y-%m-%d')),
             \`createdAt\`,
             \`id\`
         ) - 1 AS \`seq\`
       FROM \`DocumentIngest\`
     ) ranked ON ranked.\`id\` = d.\`id\`
     SET d.\`sequencePosition\` = ranked.\`seq\`
     WHERE d.\`sequencePosition\` IS NULL`
  );
  await pool.execute(
    "CREATE INDEX `DocumentIngest_company_sequence_idx` ON `DocumentIngest` (`companyId`, `sequencePosition`)"
  );
}

export async function selectIngestByJobId(jobId: string): Promise<DocumentIngestRow | undefined> {
  const pool = getPool();
  const [rows] = await pool.execute<DocumentIngestRow[]>(
    "SELECT * FROM `DocumentIngest` WHERE `jobId` = ? LIMIT 1",
    [jobId]
  );
  return rows[0];
}

export async function updateIngestJobComplete(
  jobId: string,
  processingSeconds: number,
  flagsJson: string | null
): Promise<void> {
  const pool = getPool();
  await pool.execute(
    "UPDATE `DocumentIngest` SET `status` = 'complete', `processingSeconds` = ?, `flagsJson` = ?, `updatedAt` = CURRENT_TIMESTAMP(3) WHERE `jobId` = ?",
    [processingSeconds, flagsJson, jobId]
  );
}

export async function updateIngestFromAiIngestResult(
  jobId: string,
  input: { flagsJson: string; analysisText: string; model: string }
): Promise<void> {
  const pool = getPool();
  await pool.execute(
    "UPDATE `DocumentIngest` SET `flagsJson` = ?, `aiAnalysisText` = ?, `aiAnalysisModel` = ?, `aiAnalysisAt` = CURRENT_TIMESTAMP(3), `updatedAt` = CURRENT_TIMESTAMP(3) WHERE `jobId` = ?",
    [input.flagsJson, input.analysisText, input.model, jobId]
  );
}

export async function selectPrimaryHashByJobId(jobId: string): Promise<string | null> {
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT `primaryHash` FROM `DocumentIngest` WHERE `jobId` = ? LIMIT 1",
    [jobId]
  );
  const h = (rows[0] as { primaryHash?: string } | undefined)?.primaryHash;
  return h ?? null;
}

export async function insertDocumentIngest(p: NewDocumentIngest): Promise<void> {
  const pool = getPool();
  await ensureTimelineSequenceColumn();
  const [posRows] = await pool.execute<RowDataPacket[]>(
    "SELECT COALESCE(MAX(`sequencePosition`) + 1, 0) AS `nextPosition` FROM `DocumentIngest` WHERE `companyId` = ?",
    [p.companyId]
  );
  const sequencePosition = Number((posRows[0] as { nextPosition?: number } | undefined)?.nextPosition ?? 0);
  await pool.execute(
    `INSERT INTO \`DocumentIngest\` (
      \`id\`, \`jobId\`, \`companyId\`, \`documentId\`,
      \`fileDisplayName\`, \`fileCount\`, \`totalSizeBytes\`, \`primaryHash\`, \`extraHashesJson\`,
      \`documentTypeName\`, \`temporalType\`, \`updateLabel\`, \`documentDate\`, \`receivedDate\`,
      \`language\`, \`originalSender\`, \`howReceived\`, \`provenance\`,
      \`optForensic\`, \`optExternal\`, \`optDigest\`, \`suppressFlags\`, \`sequencePosition\`,
      \`storedFilesJson\`, \`createdAt\`, \`updatedAt\`
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))`,
    [
      p.id,
      p.jobId,
      p.companyId,
      p.documentId,
      p.fileDisplayName,
      p.fileCount,
      p.totalSizeBytes,
      p.primaryHash,
      p.extraHashesJson,
      p.documentTypeName,
      p.temporalType,
      p.updateLabel,
      p.documentDate,
      p.receivedDate,
      p.language,
      p.originalSender,
      p.howReceived,
      p.provenance,
      p.optForensic,
      p.optExternal,
      p.optDigest,
      p.suppressFlags,
      sequencePosition,
      p.storedFilesJson,
    ]
  );
}

export async function selectTimelineDocumentsForCompany(
  companyId: string
): Promise<TimelineDocument[]> {
  await ensureTimelineSequenceColumn();
  const pool = getPool();
  const [rows] = await pool.execute<TimelineIngestRow[]>(
    `SELECT
       \`id\`,
       \`documentId\`,
       \`companyId\`,
       \`fileDisplayName\`,
       \`documentTypeName\`,
       \`temporalType\`,
       \`updateLabel\`,
       \`documentDate\`,
       \`receivedDate\`,
       \`language\`,
       \`suppressFlags\`,
       \`sequencePosition\`,
       \`primaryHash\`,
       \`storedFilesJson\`,
       \`flagsJson\`,
       \`createdAt\`
     FROM \`DocumentIngest\`
     WHERE \`companyId\` = ?
     ORDER BY
       COALESCE(\`sequencePosition\`, 2147483647) ASC,
       COALESCE(NULLIF(\`documentDate\`, ''), DATE_FORMAT(\`createdAt\`, '%Y-%m-%d')) ASC,
       \`createdAt\` ASC`,
    [companyId]
  );
  return rows.map(rowToTimelineDocument);
}

export async function reorderTimelineDocumentsForCompany(
  companyId: string,
  documentIds: string[]
): Promise<boolean> {
  await ensureTimelineSequenceColumn();
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT `documentId` FROM `DocumentIngest` WHERE `companyId` = ?",
    [companyId]
  );
  const current = rows.map((r) => String((r as { documentId: string }).documentId));
  if (current.length !== documentIds.length) return false;
  const currentSet = new Set(current);
  if (documentIds.some((id) => !currentSet.has(id))) return false;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    for (let i = 0; i < documentIds.length; i++) {
      await conn.execute(
        "UPDATE `DocumentIngest` SET `sequencePosition` = ?, `updatedAt` = CURRENT_TIMESTAMP(3) WHERE `companyId` = ? AND `documentId` = ?",
        [i, companyId, documentIds[i]]
      );
    }
    await conn.commit();
    return true;
  } catch (e) {
    try {
      await conn.rollback();
    } catch {
      /* ignore */
    }
    throw e;
  } finally {
    conn.release();
  }
}

export async function deleteTimelineDocumentForCompany(
  companyId: string,
  documentId: string
): Promise<TimelineDocument | null> {
  await ensureTimelineSequenceColumn();
  const pool = getPool();
  const [rows] = await pool.execute<TimelineIngestRow[]>(
    `SELECT
       \`id\`,
       \`documentId\`,
       \`companyId\`,
       \`fileDisplayName\`,
       \`documentTypeName\`,
       \`temporalType\`,
       \`updateLabel\`,
       \`documentDate\`,
       \`receivedDate\`,
       \`language\`,
       \`suppressFlags\`,
       \`sequencePosition\`,
       \`primaryHash\`,
       \`storedFilesJson\`,
       \`flagsJson\`,
       \`createdAt\`
     FROM \`DocumentIngest\`
     WHERE \`companyId\` = ? AND \`documentId\` = ?
     LIMIT 1`,
    [companyId, documentId]
  );
  const row = rows[0];
  if (!row) return null;
  const doc = rowToTimelineDocument(row, row.sequencePosition ?? 0);

  const [res] = await pool.execute<ResultSetHeader>(
    "DELETE FROM `DocumentIngest` WHERE `companyId` = ? AND `documentId` = ?",
    [companyId, documentId]
  );
  if (res.affectedRows === 0) return null;

  const uploadDir = path.join(process.cwd(), "data", "storage", "uploads", companyId, row.id);
  await rm(uploadDir, { recursive: true, force: true }).catch(() => {
    /* storage may already be gone */
  });

  const remaining = await selectTimelineDocumentsForCompany(companyId);
  await reorderTimelineDocumentsForCompany(
    companyId,
    remaining.map((d) => d.id)
  );

  return doc;
}
