import { SectionLabel } from "@/components/cerulean/SectionLabel";
import { StatCard } from "@/components/cerulean/StatCard";

export default function LPReportPage() {
  return (
    <div className="p-8">
      <h1 className="mb-6 text-page-title text-text-1">LP report</h1>
      <p className="mb-6 text-body text-text-2">Q4 2025 framing — static mock</p>

      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Portfolio companies" value={35} />
        <StatCard label="Open flags" value={8} />
        <StatCard label="High confidence" value={3} />
        <StatCard label="Coverage" value="100%" />
      </div>

      <div className="mb-8 rounded-lg border border-border bg-bg-2 p-6">
        <SectionLabel className="mb-3">Systematic oversight statement</SectionLabel>
        <p className="text-body text-text-2">
          This report summarizes linguistic and document-level signals
          observed across portfolio updates. Signals are descriptive; they
          do not constitute guidance on position sizing or timing.
        </p>
      </div>

      <SectionLabel className="mb-3">Portfolio health distribution</SectionLabel>
      <div className="flex h-8 w-full max-w-xl overflow-hidden rounded-md">
        <div className="bg-red" style={{ width: "22%" }} title="Below 40" />
        <div className="bg-amber" style={{ width: "35%" }} title="41–70" />
        <div className="bg-green" style={{ width: "43%" }} title="71+" />
      </div>
      <div className="mt-2 flex gap-4 text-[12px] text-text-3">
        <span>
          <span className="mr-1 inline-block size-2 rounded-full bg-red" />{" "}
          Below 40
        </span>
        <span>
          <span className="mr-1 inline-block size-2 rounded-full bg-amber" />{" "}
          41–70
        </span>
        <span>
          <span className="mr-1 inline-block size-2 rounded-full bg-green" />{" "}
          71+
        </span>
      </div>
    </div>
  );
}
