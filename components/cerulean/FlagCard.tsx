"use client";

import { flagPolarity, type CompanyFlagDetail } from "@/data/flag-types";
import { cn } from "@/lib/utils";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { ViewSourceButton } from "./ViewSourceButton";

const border: Record<string, string> = {
  High: "border-l-red",
  Medium: "border-l-amber",
  Low: "border-l-text-3",
};

const polarityPill = {
  negative: "bg-red-light text-red",
  positive: "bg-green-light text-green",
};

export function FlagCard({ flag }: { flag: CompanyFlagDetail }) {
  const polarity = flagPolarity(flag);
  const b = polarity === "positive" ? "border-l-green" : border[flag.confidence] ?? "border-l-border";
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
          <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium capitalize", polarityPill[polarity])}>
            {polarity}
          </span>
          <span className="text-card-title text-text-1">{flag.signalType}</span>
          {flag.informedByNote && (
            <span className="rounded bg-purple-light px-1.5 py-0.5 text-[10px] font-medium text-purple">
              ◈ Informed by your note
            </span>
          )}
        </div>
        <ViewSourceButton flag={flag} />
      </div>
      <p className="px-3 pb-2 text-body text-text-2">{flag.description}</p>
    </div>
  );
}
