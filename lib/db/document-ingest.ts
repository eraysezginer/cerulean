import type { RowDataPacket } from "mysql2";
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
  status: string;
  processingSeconds: number | null;
  jobStartedAt: Date;
  flagsJson: string | null;
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
  await pool.execute(
    `INSERT INTO \`DocumentIngest\` (
      \`id\`, \`jobId\`, \`companyId\`, \`documentId\`,
      \`fileDisplayName\`, \`fileCount\`, \`totalSizeBytes\`, \`primaryHash\`, \`extraHashesJson\`,
      \`documentTypeName\`, \`temporalType\`, \`updateLabel\`, \`documentDate\`, \`receivedDate\`,
      \`language\`, \`originalSender\`, \`howReceived\`, \`provenance\`,
      \`optForensic\`, \`optExternal\`, \`optDigest\`, \`suppressFlags\`,
      \`storedFilesJson\`, \`createdAt\`, \`updatedAt\`
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))`,
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
      p.storedFilesJson,
    ]
  );
}
