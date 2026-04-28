export const DEFAULT_COMPANY_KEY = "cerulean.defaultCompanyId";

const fallbackId = () => "";

export function getDefaultCompanyId(): string {
  if (typeof window === "undefined") return fallbackId();
  const stored = localStorage.getItem(DEFAULT_COMPANY_KEY)?.trim();
  if (stored) return stored;
  return fallbackId();
}

export function setDefaultCompanyId(id: string): void {
  if (typeof window === "undefined") return;
  const t = id.trim();
  if (!t) return;
  localStorage.setItem(DEFAULT_COMPANY_KEY, t);
  window.dispatchEvent(new Event("cerulean-default-company"));
}

/** Silinen şirket varsayılan seçiliyse localStorage’ı temizler. */
export function clearDefaultCompanyIdIfMatches(id: string): void {
  if (typeof window === "undefined") return;
  const stored = localStorage.getItem(DEFAULT_COMPANY_KEY);
  if (stored === id) {
    localStorage.removeItem(DEFAULT_COMPANY_KEY);
    window.dispatchEvent(new Event("cerulean-default-company"));
  }
}
