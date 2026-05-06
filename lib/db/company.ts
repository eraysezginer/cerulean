import { rm } from "node:fs/promises";
import path from "node:path";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { Cadence, CompanyRow } from "@/data/company-types";
import { computeHealthScoreV1FromCounts } from "@/lib/health-score-v1";
import getPool from "./pool";

export type CompanyDbRow = RowDataPacket & {
  id: string;
  legalName: string;
  health: number;
  flags: number;
  negativeFlags: number;
  positiveFlags: number;
  negativeHigh: number;
  negativeMedium: number;
  negativeLow: number;
  positiveHigh: number;
  positiveMedium: number;
  positiveLow: number;
  lastUpdate: string;
  cadence: string;
  series: string | null;
  formData: string;
};

export function mapCompanyRowToDomain(c: CompanyDbRow): CompanyRow {
  const hasBreakdown =
    c.negativeHigh != null ||
    c.negativeMedium != null ||
    c.negativeLow != null ||
    c.positiveHigh != null ||
    c.positiveMedium != null ||
    c.positiveLow != null;

  return {
    id: c.id,
    name: c.legalName,
    health: hasBreakdown
      ? computeHealthScoreV1FromCounts({
          negativeHigh: Number(c.negativeHigh ?? 0),
          negativeMedium: Number(c.negativeMedium ?? 0),
          negativeLow: Number(c.negativeLow ?? 0),
          positiveHigh: Number(c.positiveHigh ?? 0),
          positiveMedium: Number(c.positiveMedium ?? 0),
          positiveLow: Number(c.positiveLow ?? 0),
        })
      : Number(c.health ?? 0),
    flags: Number(c.flags ?? 0),
    negativeFlags: Number(c.negativeFlags ?? c.flags ?? 0),
    positiveFlags: Number(c.positiveFlags ?? 0),
    lastUpdate: c.lastUpdate,
    cadence: c.cadence as Cadence,
    series: c.series ?? undefined,
  };
}

export async function selectCompanyById(id: string): Promise<CompanyDbRow | undefined> {
  const pool = getPool();
  const [rows] = await pool.execute<CompanyDbRow[]>(
    "SELECT * FROM `Company` WHERE `id` = ? LIMIT 1",
    [id]
  );
  return rows[0];
}

export async function selectCompaniesOrderedByCreatedAt(): Promise<CompanyDbRow[]> {
  const pool = getPool();
  const [rows] = await pool.execute<CompanyDbRow[]>(
    `SELECT
       c.\`id\`,
       c.\`legalName\`,
       c.\`health\`,
       COALESCE(metrics.\`flags\`, 0) AS \`flags\`,
       COALESCE(metrics.\`negativeFlags\`, 0) AS \`negativeFlags\`,
       COALESCE(metrics.\`positiveFlags\`, 0) AS \`positiveFlags\`,
       COALESCE(metrics.\`negativeHigh\`, 0) AS \`negativeHigh\`,
       COALESCE(metrics.\`negativeMedium\`, 0) AS \`negativeMedium\`,
       COALESCE(metrics.\`negativeLow\`, 0) AS \`negativeLow\`,
       COALESCE(metrics.\`positiveHigh\`, 0) AS \`positiveHigh\`,
       COALESCE(metrics.\`positiveMedium\`, 0) AS \`positiveMedium\`,
       COALESCE(metrics.\`positiveLow\`, 0) AS \`positiveLow\`,
       DATE_FORMAT(COALESCE(metrics.\`lastUpdateAt\`, c.\`updatedAt\`), '%Y-%m-%d') AS \`lastUpdate\`,
       c.\`cadence\`,
       c.\`series\`,
       c.\`formData\`
     FROM \`Company\` c
     LEFT JOIN (
       SELECT
         d.\`companyId\`,
         COUNT(*) AS \`flags\`,
         SUM(CASE WHEN jt.\`polarity\` = 'positive' THEN 1 ELSE 0 END) AS \`positiveFlags\`,
         SUM(CASE WHEN jt.\`polarity\` = 'positive' THEN 0 ELSE 1 END) AS \`negativeFlags\`,
         SUM(CASE WHEN jt.\`polarity\` = 'positive' AND jt.\`confidence\` = 'High' THEN 1 ELSE 0 END) AS \`positiveHigh\`,
         SUM(CASE WHEN jt.\`polarity\` = 'positive' AND jt.\`confidence\` = 'Medium' THEN 1 ELSE 0 END) AS \`positiveMedium\`,
         SUM(CASE WHEN jt.\`polarity\` = 'positive' AND jt.\`confidence\` = 'Low' THEN 1 ELSE 0 END) AS \`positiveLow\`,
         SUM(CASE WHEN (jt.\`polarity\` IS NULL OR jt.\`polarity\` != 'positive') AND jt.\`confidence\` = 'High' THEN 1 ELSE 0 END) AS \`negativeHigh\`,
         SUM(CASE WHEN (jt.\`polarity\` IS NULL OR jt.\`polarity\` != 'positive') AND jt.\`confidence\` = 'Medium' THEN 1 ELSE 0 END) AS \`negativeMedium\`,
         SUM(CASE WHEN (jt.\`polarity\` IS NULL OR jt.\`polarity\` != 'positive') AND jt.\`confidence\` = 'Low' THEN 1 ELSE 0 END) AS \`negativeLow\`,
         MAX(d.\`updatedAt\`) AS \`lastUpdateAt\`
       FROM \`DocumentIngest\` d
       JOIN JSON_TABLE(
         CASE
           WHEN JSON_VALID(d.\`flagsJson\`) THEN d.\`flagsJson\`
           ELSE JSON_ARRAY()
         END,
         '$[*]' COLUMNS (
           \`polarity\` VARCHAR(16) PATH '$.polarity' NULL ON EMPTY NULL ON ERROR,
           \`confidence\` VARCHAR(16) PATH '$.confidence' NULL ON EMPTY NULL ON ERROR
         )
       ) jt
       WHERE d.\`status\` = 'complete'
         AND d.\`suppressFlags\` = FALSE
         AND d.\`flagsJson\` IS NOT NULL
         AND TRIM(d.\`flagsJson\`) != ''
         AND d.\`flagsJson\` != '[]'
       GROUP BY d.\`companyId\`
     ) metrics ON metrics.\`companyId\` = c.\`id\`
     ORDER BY c.\`createdAt\` ASC`
  );
  return rows;
}

export async function selectCompanyIds(): Promise<string[]> {
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>("SELECT `id` FROM `Company`");
  return rows.map((r) => String((r as { id: string }).id));
}

export type NewCompanyWithNotes = {
  companyId: string;
  legalName: string;
  cadence: string;
  formDataJson: string;
  notes: { id: string; tag: string; date: string; text: string }[];
};

/**
 * Tek transaction: `Company` + tüm notlar.
 */
export async function insertCompanyWithNotes(input: NewCompanyWithNotes): Promise<void> {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute(
      "INSERT INTO `Company` (`id`, `legalName`, `cadence`, `formData`, `createdAt`, `updatedAt`) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))",
      [input.companyId, input.legalName, input.cadence, input.formDataJson]
    );
    for (const n of input.notes) {
      await conn.execute(
        "INSERT INTO `Note` (`id`, `companyId`, `tag`, `date`, `text`) VALUES (?, ?, ?, ?, ?)",
        [n.id, input.companyId, n.tag, n.date, n.text]
      );
    }
    await conn.commit();
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

/**
 * Sihirbaz notları (n1–n4) silinir, yenileri eklenir; aynı companyId’deki diğer notlara dokunulmaz.
 */
export async function updateCompanyWithNotes(input: NewCompanyWithNotes): Promise<void> {
  const pool = getPool();
  const conn = await pool.getConnection();
  const wizardNoteIds = [1, 2, 3, 4].map((i) => `${input.companyId}-n${i}`);
  try {
    await conn.beginTransaction();
    await conn.execute(
      "UPDATE `Company` SET `legalName` = ?, `cadence` = ?, `formData` = ?, `updatedAt` = CURRENT_TIMESTAMP(3) WHERE `id` = ?",
      [input.legalName, input.cadence, input.formDataJson, input.companyId]
    );
    await conn.execute(
      "DELETE FROM `Note` WHERE `companyId` = ? AND `id` IN (?, ?, ?, ?)",
      [input.companyId, ...wizardNoteIds]
    );
    for (const n of input.notes) {
      await conn.execute(
        "INSERT INTO `Note` (`id`, `companyId`, `tag`, `date`, `text`) VALUES (?, ?, ?, ?, ?)",
        [n.id, input.companyId, n.tag, n.date, n.text]
      );
    }
    await conn.commit();
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

/**
 * `Note` + `DocumentIngest` + `Company` satırlarını siler; upload klasörünü temizlemeye çalışır.
 * @returns Silinen `Company` satırı varsa `true`
 */
export async function deleteCompanyAndRelatedData(companyId: string): Promise<boolean> {
  const pool = getPool();
  const conn = await pool.getConnection();
  let deleted = false;
  try {
    await conn.beginTransaction();
    await conn.execute("DELETE FROM `Note` WHERE `companyId` = ?", [companyId]);
    await conn.execute("DELETE FROM `DocumentIngest` WHERE `companyId` = ?", [companyId]);
    const [res] = await conn.execute<ResultSetHeader>(
      "DELETE FROM `Company` WHERE `id` = ?",
      [companyId]
    );
    deleted = res.affectedRows > 0;
    await conn.commit();
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

  if (deleted) {
    const uploadDir = path.join(process.cwd(), "data", "storage", "uploads", companyId);
    await rm(uploadDir, { recursive: true, force: true }).catch(() => {
      /* no dir / permission */
    });
  }

  return deleted;
}
