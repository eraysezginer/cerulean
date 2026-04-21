import { notFound } from "next/navigation";
import { getCompanyById } from "@/data/companies";
import {
  CADENCE_UPDATE_RANGE,
  MISSING_UPDATE_IDS,
  METRIC_COUNT_PER_UPDATE,
  RESPONSE_LATENCY_DAYS,
  kalderSendTime,
  latencyBarClass,
  metricBarClass,
} from "@/data/behavioral";

const latencyLabels = Array.from(
  { length: RESPONSE_LATENCY_DAYS.length },
  (_, i) => `U${i + 1}`
);
const metricLabels = Array.from(
  { length: METRIC_COUNT_PER_UPDATE.length },
  (_, i) => `U${i + 1}`
);

function SectionHeading({
  children,
  withDivider,
}: {
  children: React.ReactNode;
  withDivider?: boolean;
}) {
  return (
    <div
      className={
        "mb-3 flex w-full max-w-4xl items-center gap-3 text-section-label uppercase text-text-3" +
        (withDivider ? " border-b border-border pb-2" : "")
      }
    >
      {children}
    </div>
  );
}

export default function BehavioralPage({
  params,
}: {
  params: { id: string };
}) {
  const company = getCompanyById(params.id);
  if (!company) notFound();

  const send = kalderSendTime;
  const maxLat = Math.max(...RESPONSE_LATENCY_DAYS);
  const maxMet = Math.max(...METRIC_COUNT_PER_UPDATE);

  const cadenceIds = Array.from({ length: CADENCE_UPDATE_RANGE }, (_, i) => i + 1);

  return (
    <div className="p-8">
      <p className="mb-1 text-section-label uppercase text-text-3">Portfolio</p>
      <h1 className="mb-1 text-page-title text-text-1">
        {company.name} — Behavioral
      </h1>
      <p className="mb-8 max-w-2xl text-body text-text-2">
        Cadence, send-time, and disclosure-depth signals derived from update
        metadata and body text. Signals are descriptive only.
      </p>

      <SectionHeading withDivider>Cadence timeline</SectionHeading>
      <p className="mb-3 text-[13px] text-text-3">
        Expected update index U1–U14. Missing slots are labeled (not received).
      </p>
      <div className="mb-10 max-w-4xl overflow-x-auto pb-1">
        <div className="flex min-w-min gap-1.5">
          {cadenceIds.map((id) => {
            const missing = MISSING_UPDATE_IDS.has(id);
            return (
              <div
                key={id}
                className={
                  "flex min-w-[52px] flex-col items-center rounded-md border px-2 py-1.5 text-center " +
                  (missing
                    ? "border-red/40 bg-red-light/80"
                    : "border-border bg-bg-2")
                }
              >
                <span
                  className={
                    "font-mono text-[13px] font-semibold tabular-nums " +
                    (missing ? "text-red" : "text-text-1")
                  }
                >
                  U{id}
                </span>
                {missing ? (
                  <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-red/90">
                    Missing
                  </span>
                ) : (
                  <span className="mt-0.5 text-[10px] text-text-3">Received</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <SectionHeading withDivider>Send time pattern</SectionHeading>
      <div className="mb-10 max-w-4xl rounded-lg border border-border bg-bg-2 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-md border border-border bg-bg p-4">
            <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-text-3">
              {send.historicalLabel}
            </p>
            <p className="text-card-title text-text-1">{send.historicalWindow}</p>
            <p className="mt-2 text-[13px] leading-snug text-text-2">
              Based on U1–U13 timestamps (metadata).
            </p>
          </div>
          <div className="rounded-md border border-amber/40 bg-amber-light/50 p-4">
            <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-amber">
              {send.anomalousLabel}
            </p>
            <p className="text-card-title text-amber">{send.anomalousDetail}</p>
            <p className="mt-2 text-[13px] leading-snug text-text-2">
              First observed deviation from Tuesday morning cluster.
            </p>
          </div>
        </div>
        <p className="mt-4 border-t border-border pt-4 text-body text-text-2">
          {send.note}
        </p>
      </div>

      <SectionHeading withDivider>
        Response latency — days to reply
      </SectionHeading>
      <p className="mb-3 text-[13px] text-text-3">
        Ten observations (chronological). Teal &lt; 2d · Amber 2–5d · Red
        &gt; 5d.
      </p>
      <div className="mb-10 max-w-4xl">
        <div className="flex h-40 items-end gap-1.5 rounded-lg border border-border bg-bg px-2 pb-1 pt-3">
          {RESPONSE_LATENCY_DAYS.map((v, i) => (
            <div
              key={i}
              className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1"
            >
              <div
                className={
                  "w-full min-h-[4px] rounded-t-sm transition-colors " +
                  latencyBarClass(v)
                }
                style={{ height: `${Math.max(8, (v / maxLat) * 100)}%` }}
                title={`${v} days`}
              />
              <span className="font-mono text-[11px] tabular-nums text-text-1">
                {v}
              </span>
              <span className="text-[10px] text-text-3">{latencyLabels[i]}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-4 text-[11px] text-text-3">
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-sm bg-teal" /> &lt; 2 days
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-sm bg-amber" /> 2–5 days
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-sm bg-red" /> &gt; 5 days
          </span>
        </div>
      </div>

      <SectionHeading withDivider>Metric count per update</SectionHeading>
      <p className="mb-3 text-[13px] text-text-3">
        Count of quantitative line items per update (U1–U10). Teal ≥ 8 · Amber
        4–7 · Red ≤ 3.
      </p>
      <div className="max-w-4xl">
        <div className="flex h-40 items-end gap-1.5 rounded-lg border border-border bg-bg px-2 pb-1 pt-3">
          {METRIC_COUNT_PER_UPDATE.map((v, i) => (
            <div
              key={i}
              className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1"
            >
              <div
                className={
                  "w-full min-h-[4px] rounded-t-sm " + metricBarClass(v)
                }
                style={{ height: `${Math.max(8, (v / maxMet) * 100)}%` }}
                title={`${v} metrics`}
              />
              <span className="font-mono text-[11px] tabular-nums text-text-1">
                {v}
              </span>
              <span className="text-[10px] text-text-3">{metricLabels[i]}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-4 text-[11px] text-text-3">
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-sm bg-teal" /> ≥ 8 metrics
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-sm bg-amber" /> 4–7
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-sm bg-red" /> ≤ 3
          </span>
        </div>
      </div>
    </div>
  );
}
