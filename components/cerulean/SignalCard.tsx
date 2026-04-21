import type { ExternalSignal } from "@/data/signals";
import { cn } from "@/lib/utils";
import { ConfidenceBadge } from "./ConfidenceBadge";

const mapSev = {
  High: "High" as const,
  Medium: "Medium" as const,
  Low: "Low" as const,
};

const border: Record<ExternalSignal["border"], string> = {
  red: "border-l-red",
  amber: "border-l-amber",
  grey: "border-l-text-3",
};

export function SignalCard({ signal }: { signal: ExternalSignal }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-bg-2 p-3 pl-3",
        "border-l-[3px]",
        border[signal.border]
      )}
    >
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <span className="rounded bg-bg-3 px-1.5 py-0.5 text-[12px] font-medium text-text-2">
          {signal.source}
        </span>
        <span className="text-card-title text-text-1">{signal.signalType}</span>
        <ConfidenceBadge level={mapSev[signal.severity]} />
        <span className="ml-auto text-[12px] text-text-3">{signal.ago}</span>
      </div>
      <p className="text-body text-text-2">{signal.description}</p>
    </div>
  );
}
