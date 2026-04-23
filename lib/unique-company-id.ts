import { companies } from "@/data/company-seed";
import { selectCompanyIds } from "@/lib/db/company";
import { slugifyName } from "@/lib/slugify";

/**
 * Unique slug id across seed portfolio + `Company` table in MySQL.
 */
export async function uniqueCompanyIdForLegalName(legal: string): Promise<string> {
  const baseId = slugifyName(legal) || "company";
  const fromDb = await selectCompanyIds();
  const taken = new Set<string>([...companies.map((c) => c.id), ...fromDb]);

  let id = baseId;
  let n = 2;
  while (taken.has(id)) {
    id = `${baseId}-${n}`;
    n += 1;
  }
  return id;
}
