import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { randomUUID } from "node:crypto";
import getPool from "./pool";

export type NoteDbRow = RowDataPacket & {
  id: string;
  tag: string;
  date: string;
  text: string;
};

export async function selectNotesForCompany(companyId: string): Promise<NoteDbRow[]> {
  const pool = getPool();
  const [rows] = await pool.execute<NoteDbRow[]>(
    "SELECT `id`, `tag`, `date`, `text` FROM `Note` WHERE `companyId` = ? ORDER BY `createdAt` ASC",
    [companyId]
  );
  return rows;
}

export async function insertContextNote(
  companyId: string,
  text: string,
  id: string = randomUUID().replace(/-/g, "")
): Promise<void> {
  const pool = getPool();
  const date = new Date().toISOString().slice(0, 10);
  await pool.execute(
    "INSERT INTO `Note` (`id`, `companyId`, `tag`, `date`, `text`) VALUES (?, ?, 'Context', ?, ?)",
    [id, companyId, date, text]
  );
}

export async function insertNote(input: {
  companyId: string;
  tag: string;
  text: string;
  id?: string;
}): Promise<NoteDbRow> {
  const pool = getPool();
  const id = input.id ?? randomUUID().replace(/-/g, "");
  const date = new Date().toISOString().slice(0, 10);
  await pool.execute(
    "INSERT INTO `Note` (`id`, `companyId`, `tag`, `date`, `text`) VALUES (?, ?, ?, ?, ?)",
    [id, input.companyId, input.tag, date, input.text]
  );
  return { id, tag: input.tag, date, text: input.text } as NoteDbRow;
}

export async function deleteNoteForCompany(
  companyId: string,
  noteId: string
): Promise<boolean> {
  const pool = getPool();
  const [res] = await pool.execute<ResultSetHeader>(
    "DELETE FROM `Note` WHERE `companyId` = ? AND `id` = ?",
    [companyId, noteId]
  );
  return res.affectedRows > 0;
}
