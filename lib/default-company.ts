import { companies } from "@/data/company-seed";

export const DEFAULT_COMPANY_KEY = "cerulean.defaultCompanyId";

export function getDefaultCompanyId(): string {
  if (typeof window === "undefined") return companies[0].id;
  const stored = localStorage.getItem(DEFAULT_COMPANY_KEY);
  if (stored && companies.some((c) => c.id === stored)) return stored;
  return companies[0].id;
}

export function setDefaultCompanyId(id: string): void {
  if (typeof window === "undefined") return;
  if (!companies.some((c) => c.id === id)) return;
  localStorage.setItem(DEFAULT_COMPANY_KEY, id);
  window.dispatchEvent(new Event("cerulean-default-company"));
}
