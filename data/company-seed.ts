import type { CompanyRow } from "./company-types";

/** Legacy seed portfolio removed; company lists should come from the database. */
export const companies: CompanyRow[] = [];

export function isSeedCompanyId(id: string): boolean {
  return companies.some((c) => c.id === id);
}
