import type { TimelineDocument } from "@/data/timeline";
import { getSeedDocumentsForCompany } from "@/data/timeline";

const byCompany = new Map<string, TimelineDocument[]>();

export function getTimelineDocuments(companyId: string): TimelineDocument[] {
  if (!byCompany.has(companyId)) {
    byCompany.set(companyId, getSeedDocumentsForCompany(companyId));
  }
  return byCompany
    .get(companyId)!
    .map((d) => ({ ...d }))
    .sort((a, b) => a.sequencePosition - b.sequencePosition);
}

export function setTimelineDocuments(companyId: string, list: TimelineDocument[]): void {
  byCompany.set(companyId, list.map((d) => ({ ...d })));
}

export function replaceWithSeed(companyId: string): void {
  byCompany.set(companyId, getSeedDocumentsForCompany(companyId));
}

/** Şirket silindiğinde bellekteki timeline önbelleğini kaldırır. */
export function forgetTimelineForCompany(companyId: string): void {
  byCompany.delete(companyId);
}
