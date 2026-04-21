"use client";

import type { CompanyFlagDetail } from "@/data/flags";
import { cn } from "@/lib/utils";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { ViewSourceButton } from "./ViewSourceButton";

const border: Record<string, string> = {
  High: "border-l-red",
  Medium: "border-l-amber",
  Low: "border-l-text-3",
};

export function FlagCard({ flag }: { flag: CompanyFlagDetail }) {
  const b = border[flag.confidence] ?? "border-l-border";
  return (
    <div
      className={cn(
        "relative min-h-[82px] rounded-lg border border-border bg-bg-2 pl-3",
        "border-l-[3px]",
        b
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2 p-3 pr-2">
        <div className="flex flex-wrap items-center gap-2">
          <ConfidenceBadge level={flag.confidence} />
          <span className="text-card-title text-text-1">{flag.signalType}</span>
          {flag.informedByNote && (
            <span className="rounded bg-purple-light px-1.5 py-0.5 text-[10px] font-medium text-purple">
              ◈ Informed by your note
            </span>
          )}
        </div>
        <ViewSourceButton flagId={flag.id} />
      </div>
      <p className="px-3 pb-2 text-body text-text-2">{flag.description}</p>
      <div className="mx-3 mb-3 rounded bg-bg-3 px-2 py-1.5 font-mono text-source-anchor text-text-3">
        Source: {flag.sourceAnchor}
      </div>
    </div>
  );
}
