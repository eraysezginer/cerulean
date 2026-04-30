"use client";

import { flagPolarity, type CompanyFlagDetail } from "@/data/flag-types";
import { FlagCard } from "./FlagCard";

export function FlagGroups({
  flags,
  emptyText = "No flags yet.",
  polarity,
}: {
  flags: CompanyFlagDetail[];
  emptyText?: string;
  polarity?: "negative" | "positive";
}) {
  const negative = flags.filter((f) => flagPolarity(f) === "negative");
  const positive = flags.filter((f) => flagPolarity(f) === "positive");

  if (flags.length === 0 && !polarity) {
    return <p className="text-body text-text-2">{emptyText}</p>;
  }

  if (polarity === "negative") {
    return (
      <FlagSection
        title="Negative Flags"
        description="Risks, inconsistencies, deterioration, silence, or other investor concerns."
        count={negative.length}
        flags={negative}
        empty="No negative flags found."
      />
    );
  }

  if (polarity === "positive") {
    return (
      <FlagSection
        title="Positive Flags"
        description="Strengths, improvements, consistency, traction, or other positive signals."
        count={positive.length}
        flags={positive}
        empty="No positive flags found yet."
      />
    );
  }

  return (
    <div className="space-y-6">
      <FlagSection
        title="Negative Flags"
        description="Risks, inconsistencies, deterioration, silence, or other investor concerns."
        count={negative.length}
        flags={negative}
        empty="No negative flags found."
      />
      <FlagSection
        title="Positive Flags"
        description="Strengths, improvements, consistency, traction, or other positive signals."
        count={positive.length}
        flags={positive}
        empty="No positive flags found yet."
      />
    </div>
  );
}

function FlagSection({
  title,
  description,
  count,
  flags,
  empty,
}: {
  title: string;
  description: string;
  count: number;
  flags: CompanyFlagDetail[];
  empty: string;
}) {
  return (
    <section className="rounded-xl border border-border bg-bg p-3">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-[15px] font-semibold text-text-1">{title}</h2>
          <p className="mt-0.5 text-[12px] text-text-3">{description}</p>
        </div>
        <span className="rounded-full bg-bg-3 px-2 py-0.5 text-[11px] font-medium text-text-2">
          {count}
        </span>
      </div>
      {flags.length ? (
        <div className="space-y-3">
          {flags.map((f) => (
            <FlagCard key={f.id} flag={f} />
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-border bg-bg-2 px-3 py-4 text-[13px] text-text-3">
          {empty}
        </p>
      )}
    </section>
  );
}
