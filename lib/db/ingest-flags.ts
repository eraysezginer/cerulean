import type { RowDataPacket } from "mysql2";
import type { CompanyFlagDetail, Confidence, PortfolioFlag } from "@/data/flags";
import getPool from "./pool";

type IngestFlagsRow = RowDataPacket & {
  jobId: string;
  companyId: string;
  documentId: string;
  fileDisplayName: string;
  updateLabel: string;
  documentTypeName: string;
  documentDate: string;
  receivedDate: string;
  primaryHash: string;
  aiAnalysisAt: Date | null;
  aiAnalysisModel: string | null;
  flagsJson: string | null;
  legalName: string;
};

function parseFlagsArray(s: string | null): CompanyFlagDetail[] {
  if (s == null || !String(s).trim() || s === "[]") return [];
  try {
    const arr = JSON.parse(s) as CompanyFlagDetail[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function confidenceToDot(confidence: Confidence): "red" | "amber" | "grey" {
  if (confidence === "High") return "red";
  if (confidence === "Medium") return "amber";
  return "grey";
}

/**
 * All monitoring flags from completed ingests for one company (AI `flagsJson` only).
 */
export async function getIngestFlagsForCompany(companyId: string): Promise<CompanyFlagDetail[]> {
  const pool = getPool();
  const [rows] = await pool.execute<IngestFlagsRow[]>(
    `SELECT
       d.\`jobId\`,
       d.\`companyId\`,
       d.\`documentId\`,
       d.\`fileDisplayName\`,
       d.\`updateLabel\`,
       d.\`documentTypeName\`,
       d.\`documentDate\`,
       d.\`receivedDate\`,
       d.\`primaryHash\`,
       d.\`aiAnalysisAt\`,
       d.\`aiAnalysisModel\`,
       d.\`flagsJson\`,
       c.\`legalName\`
     FROM \`DocumentIngest\` d
     INNER JOIN \`Company\` c ON c.\`id\` = d.\`companyId\`
     WHERE d.\`companyId\` = ?
       AND d.\`status\` = 'complete'
       AND d.\`suppressFlags\` = FALSE
       AND d.\`flagsJson\` IS NOT NULL
       AND d.\`flagsJson\` != '[]'
       AND TRIM(d.\`flagsJson\`) != ''
     ORDER BY d.\`updatedAt\` DESC`,
    [companyId]
  );
  const out: CompanyFlagDetail[] = [];
  for (const r of rows) {
    for (const f of parseFlagsArray(r.flagsJson)) {
      out.push({
        ...f,
        id: `${r.jobId}__${f.id}`,
        source: {
          companyName: r.legalName,
          fileDisplayName: r.fileDisplayName,
          updateLabel: r.updateLabel,
          documentTypeName: r.documentTypeName,
          documentDate: r.documentDate,
          receivedDate: r.receivedDate,
          jobId: r.jobId,
          documentId: r.documentId,
          primaryHash: r.primaryHash,
          aiAnalysisAt: r.aiAnalysisAt ? r.aiAnalysisAt.toISOString() : null,
          aiAnalysisModel: r.aiAnalysisModel,
        },
      });
    }
  }
  return out;
}

/**
 * Flattened portfolio view: one row per flag from any completed ingest (joined with company name).
 */
export async function getIngestFlagsForPortfolio(): Promise<PortfolioFlag[]> {
  const pool = getPool();
  const [rows] = await pool.execute<IngestFlagsRow[]>(
    `SELECT d.\`jobId\`, d.\`companyId\`, d.\`fileDisplayName\`, d.\`updateLabel\`, d.\`flagsJson\`, c.\`legalName\`
     FROM \`DocumentIngest\` d
     INNER JOIN \`Company\` c ON c.\`id\` = d.\`companyId\`
     WHERE d.\`status\` = 'complete'
       AND d.\`flagsJson\` IS NOT NULL
       AND d.\`flagsJson\` != '[]'
       AND TRIM(d.\`flagsJson\`) != ''
     ORDER BY d.\`updatedAt\` DESC`,
    []
  );
  const out: PortfolioFlag[] = [];
  for (const r of rows) {
    let i = 0;
    for (const f of parseFlagsArray(r.flagsJson)) {
      out.push({
        id: `${r.jobId}__${f.id}__${i++}`,
        companyId: r.companyId,
        companyName: r.legalName,
        signalType: f.signalType,
        confidence: f.confidence,
        updateRef: r.fileDisplayName || r.updateLabel || "—",
        signalCount: 1,
        dotColor: confidenceToDot(f.confidence),
      });
    }
  }
  return out;
}
