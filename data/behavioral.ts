/** Kalder (ve mock) davranışsal seriler — spec ile uyumlu */

export const CADENCE_UPDATE_RANGE = 14;
/** Spec: U7 ve U12 eksik / alınmadı */
export const MISSING_UPDATE_IDS = new Set([7, 12]);

export const RESPONSE_LATENCY_DAYS = [
  1.2, 0.8, 1.1, 0.9, 1.4, 2.1, 3.8, 5.2, 8.1, 12.4,
] as const;

/** U1–U10 metrik derinliği (spec) */
export const METRIC_COUNT_PER_UPDATE = [
  12, 11, 13, 12, 10, 8, 6, 6, 4, 3,
] as const;

export type SendTimePattern = {
  historicalLabel: string;
  historicalWindow: string;
  anomalousLabel: string;
  anomalousDetail: string;
  note: string;
};

export const kalderSendTime: SendTimePattern = {
  historicalLabel: "Historical send window",
  historicalWindow: "Tuesdays · 09:00–10:30 (founder local)",
  anomalousLabel: "Update 14 (anomalous)",
  anomalousDetail: "Thursday · 14:22 — outside prior distribution",
  note: "Send-time distance from baseline: 2.4σ (corroborating signal only).",
};

export function latencyBarClass(days: number): string {
  if (days < 2) return "bg-teal";
  if (days <= 5) return "bg-amber";
  return "bg-red";
}

/** Metrik sayısı: yüksek açıklık = teal; orta = amber; düşük = red */
export function metricBarClass(count: number): string {
  if (count >= 8) return "bg-teal";
  if (count >= 4) return "bg-amber";
  return "bg-red";
}
