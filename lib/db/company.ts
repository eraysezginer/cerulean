import { rm } from "node:fs/promises";
import path from "node:path";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { Cadence, CompanyRow } from "@/data/company-types";
import getPool from "./pool";

export type CompanyDbRow = RowDataPacket & {
  id: string;
  legalName: string;
  health: number;
  flags: number;
  lastUpdate: string;
  cadence: string;
  series: string | null;
  formData: string;
};

export function mapCompanyRowToDomain(c: CompanyDbRow): CompanyRow {
  return {
    id: c.id,
    name: c.legalName,
    health: c.health,
    flags: c.flags,
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
    "SELECT * FROM `Company` ORDER BY `createdAt` ASC"
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
