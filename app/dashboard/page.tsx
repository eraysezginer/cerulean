import { portfolioFlags } from "@/data/flags";
import { SectionLabel } from "@/components/cerulean/SectionLabel";
import { StatCard } from "@/components/cerulean/StatCard";
import { ViewSourceButton } from "@/components/cerulean/ViewSourceButton";
import { cn } from "@/lib/utils";

const dot: Record<"red" | "amber" | "grey", string> = {
  red: "bg-red",
  amber: "bg-amber",
  grey: "bg-text-3",
};

export default function DashboardPage() {
  return (
    <div className="p-8">
      <p className="mb-1 text-section-label uppercase text-text-3">Overview</p>
      <h1 className="mb-1 text-page-title text-text-1">Dashboard</h1>
      <p className="mb-6 max-w-2xl text-body text-text-2">
        Portfolio-wide health overview and recent high-confidence flags
      </p>

      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Portfolio companies" value={35} />
        <StatCard label="Active flags" value={8} />
        <StatCard label="High confidence" value={3} />
        <StatCard label="Silenced (14d+)" value={2} />
      </div>

      <SectionLabel withDivider className="mb-3 w-full">
        Recent flags
      </SectionLabel>

      <div className="rounded-lg border border-border overflow-hidden">
        {portfolioFlags.map((row, i) => (
          <div
            key={row.id}
            className={cn(
              "flex flex-wrap items-center gap-3 border-b border-border px-3 py-2.5 last:border-b-0",
              i % 2 === 1 && "bg-bg-2"
            )}
          >
            <span
              className={cn("size-2 shrink-0 rounded-full", dot[row.dotColor])}
            />
            <div className="min-w-0 flex-1">
              <span className="font-semibold text-text-1">{row.companyName}</span>
              <span className="text-body text-text-2"> — {row.signalType}</span>
              <span className="text-body text-text-2"> — {row.confidence}</span>
              <span className="text-body text-text-2"> — {row.updateRef}</span>
            </div>
            <ViewSourceButton flagId={row.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
