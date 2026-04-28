import type { CompanyRow } from "./company-types";
import {
  mapCompanyRowToDomain,
  selectCompaniesOrderedByCreatedAt,
  selectCompanyById,
} from "@/lib/db/company";

export type { Cadence, CompanyRow } from "./company-types";

export async function getCompanyById(id: string): Promise<CompanyRow | undefined> {
  const row = await selectCompanyById(id);
  if (row) {
    return mapCompanyRowToDomain(row);
  }
  return undefined;
}

/** Persisted company rows only. */
export async function getAllCompaniesList(): Promise<CompanyRow[]> {
  const fromDb = await selectCompaniesOrderedByCreatedAt();
  return fromDb.map(mapCompanyRowToDomain);
}
