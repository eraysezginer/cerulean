/**
 * Pre-registered sender addresses for upload provenance (mock).
 * Full Cerulean would load from the company’s ingestion config.
 */
export function getFounderEmailsForCompany(companyId: string): string[] {
  const m: Record<string, string[]> = {
    kalder: ["founder@kalder.com", "cfo@kalder.com"],
    allhere: ["team@allhere.com"],
  };
  return m[companyId] ?? [`primary@${companyId}.com`];
}
