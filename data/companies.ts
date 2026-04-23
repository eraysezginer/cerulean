import { companies as seedCompanies } from "./company-seed";
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
  return seedCompanies.find((c) => c.id === id);
}

/** Seed portfolio + MySQL `Company` rows. */
export async function getAllCompaniesList(): Promise<CompanyRow[]> {
  const fromDb = await selectCompaniesOrderedByCreatedAt();
  return [...seedCompanies, ...fromDb.map(mapCompanyRowToDomain)];
}
