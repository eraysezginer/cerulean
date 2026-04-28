export type SendTimePattern = {
  historicalLabel: string;
  historicalWindow: string;
  anomalousLabel: string;
  anomalousDetail: string;
  note: string;
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
