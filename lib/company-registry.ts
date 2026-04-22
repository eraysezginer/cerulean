import type { Cadence, CompanyRow } from "@/data/company-types";

const added = new Map<string, CompanyRow>();

export function registerCompany(row: CompanyRow): void {
  added.set(row.id, row);
}

export function getAddedCompany(id: string): CompanyRow | undefined {
  return added.get(id);
}

export function listAddedCompanies(): CompanyRow[] {
  return Array.from(added.values());
}

export function newCompanyFromForm(input: {
  id: string;
  name: string;
  cadence: Cadence;
}): CompanyRow {
  return {
    id: input.id,
    name: input.name,
    health: 50,
    flags: 0,
    lastUpdate: "—",
    cadence: input.cadence,
    series: undefined,
  };
}
