import Link from "next/link";
import {
  BellOff,
  Building2,
  Flag,
  Sparkles,
} from "lucide-react";
import { getPortfolioFlagsSorted } from "@/data/flags";
import type { Confidence } from "@/data/flag-types";
import { StatCard } from "@/components/cerulean/StatCard";
import { ViewSourceButton } from "@/components/cerulean/ViewSourceButton";
import { cn } from "@/lib/utils";

const dot: Record<"red" | "amber" | "grey" | "green", string> = {
  red: "bg-red shadow-[0_0_0_2px_rgba(204,34,34,0.15)]",
  amber: "bg-amber shadow-[0_0_0_2px_rgba(184,90,26,0.15)]",
  grey: "bg-text-3 shadow-[0_0_0_2px_rgba(163,163,163,0.2)]",
  green: "bg-green shadow-[0_0_0_2px_rgba(26,122,74,0.16)]",
};

function confidenceBadge(c: Confidence) {
  const styles: Record<Confidence, string> = {
    High: "bg-teal-light text-teal ring-1 ring-teal/25",
    Medium: "bg-amber-light text-amber ring-1 ring-amber/25",
    Low: "bg-bg-3 text-text-2 ring-1 ring-border/80",
  };
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        styles[c]
      )}
    >
      {c}
    </span>
  );
}

export default async function DashboardPage() {
  const portfolioFlags = await getPortfolioFlagsSorted();
  const highCount = portfolioFlags.filter((f) => f.confidence === "High").length;
  const positiveCount = portfolioFlags.filter((f) => f.polarity === "positive").length;

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)]">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-20%,rgba(11,114,117,0.12),transparent_55%)]"
        aria-hidden
      />
      <div className="relative p-8">
        <p className="mb-1 text-section-label uppercase text-text-3">Overview</p>
        <h1 className="mb-1 text-page-title text-text-1">Dashboard</h1>
        <p className="mb-8 max-w-2xl text-body text-text-2">
          Portfolio-wide health overview and recent high-confidence flags — at a glance.
        </p>

        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Portfolio companies"
            value={35}
            icon={<Building2 strokeWidth={2} />}
            hint="Tracked in this workspace"
            accent="teal"
          />
          <StatCard
            label="Active flags"
            value={portfolioFlags.length}
            icon={<Flag strokeWidth={2} />}
            hint={`${positiveCount} positive signals`}
            accent="amber"
          />
          <StatCard
            label="High confidence"
            value={highCount}
            icon={<Sparkles strokeWidth={2} />}
            hint="Model flag rating"
            accent="teal"
          />
          <StatCard
            label="Silenced (14d+)"
            value={2}
            icon={<BellOff strokeWidth={2} />}
            hint="No investor update window"
            accent="rose"
          />
        </div>

        <section
          className="overflow-hidden rounded-2xl border border-border/80 bg-bg shadow-md ring-1 ring-black/[0.04]"
          aria-labelledby="recent-flags-heading"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 bg-gradient-to-r from-bg-2/80 to-teal-light/30 px-5 py-4">
            <div>
              <h2 id="recent-flags-heading" className="text-card-title text-text-1">
                Recent flags
              </h2>
              <p className="mt-0.5 text-[13px] text-text-2">
                {portfolioFlags.length} item{portfolioFlags.length === 1 ? "" : "s"} from analysis ·
                grouped as negative or positive
              </p>
            </div>
            <Link
              href="/flags/active"
              className="text-[13px] font-medium text-teal underline-offset-2 hover:underline"
            >
              View all →
            </Link>
          </div>

          {portfolioFlags.length === 0 ? (
            <p className="px-5 py-8 text-body text-text-2">
              No flags yet. Run <strong>Generate flags and analysis</strong> after an upload to populate
              this list.
            </p>
          ) : (
            <ul className="divide-y divide-border/60">
              {portfolioFlags.map((row) => (
                <li
                  key={row.id}
                  className="group flex flex-wrap items-start gap-3 px-5 py-4 transition-colors hover:bg-bg-2/50"
                >
                  <span
                    className={cn(
                      "mt-1.5 size-2.5 shrink-0 rounded-full",
                      dot[row.dotColor]
                    )}
                    title={
                      row.dotColor === "green"
                        ? "Positive"
                        : row.dotColor === "red"
                        ? "High attention"
                        : row.dotColor === "amber"
                          ? "Watch"
                          : "FYI"
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 gap-y-1">
                      <span className="font-semibold text-text-1">{row.companyName}</span>
                      {confidenceBadge(row.confidence)}
                      <span className="rounded-full bg-bg-3 px-2 py-0.5 text-[11px] font-medium capitalize text-text-2">
                        {row.polarity}
                      </span>
                    </div>
                    <p className="mt-1 text-[14px] text-text-2">{row.signalType}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-text-3">
                      <span className="tabular-nums">{row.updateRef}</span>
                      <span className="hidden min-[480px]:inline" aria-hidden>
                        ·
                      </span>
                      <span className="text-text-3">Document ingest</span>
                    </div>
                  </div>
                  <div className="shrink-0 pt-0.5">
                    <ViewSourceButton
                      flag={{
                        id: row.id,
                        confidence: row.confidence,
                        polarity: row.polarity,
                        signalType: row.signalType,
                        description: "Portfolio flag from document analysis.",
                        sourceAnchor: row.updateRef,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
