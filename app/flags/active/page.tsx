import { getPortfolioFlagsSorted } from "@/data/flags";
import { Button } from "@/components/ui/button";
import { ConfidenceBadge } from "@/components/cerulean/ConfidenceBadge";
import { cn } from "@/lib/utils";

const dot: Record<string, string> = {
  High: "bg-red",
  Medium: "bg-amber",
  Low: "bg-text-3",
  positive: "bg-green",
};

export default async function ActiveFlagsPage() {
  const rows = await getPortfolioFlagsSorted();
  const high = rows.filter((r) => r.confidence === "High").length;
  const negativeRows = rows.filter((r) => r.polarity === "negative");
  const positiveRows = rows.filter((r) => r.polarity === "positive");

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-page-title text-text-1">Active flags</h1>
          <p className="text-body text-text-2">
            {rows.length} flag{rows.length === 1 ? "" : "s"} from document analysis
            {rows.length > 0 ? ` · ${negativeRows.length} negative · ${positiveRows.length} positive · ${high} high confidence` : ""} · sorted by severity
          </p>
        </div>
        <Button type="button" variant="outline" size="sm">
          Export all
        </Button>
      </div>

      {rows.length === 0 ? (
        <p className="text-body text-text-2">
          No data yet. Complete an upload and run AI analysis; flags from ingests will appear here.
        </p>
      ) : (
        <div className="space-y-6">
          <PortfolioFlagTable title="Negative Flags" rows={negativeRows} />
          <PortfolioFlagTable title="Positive Flags" rows={positiveRows} />
        </div>
      )}
    </div>
  );
}

function PortfolioFlagTable({
  title,
  rows,
}: {
  title: string;
  rows: Awaited<ReturnType<typeof getPortfolioFlagsSorted>>;
}) {
  return (
    <section className="rounded-lg border border-border">
      <div className="flex items-center justify-between border-b border-border bg-bg-2 px-3 py-2">
        <h2 className="text-[14px] font-semibold text-text-1">{title}</h2>
        <span className="rounded-full bg-bg px-2 py-0.5 text-[11px] text-text-2">{rows.length}</span>
      </div>
      {rows.length === 0 ? (
        <p className="px-3 py-5 text-body text-text-3">No {title.toLowerCase()} found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-body">
            <thead>
              <tr className="border-b border-border bg-bg-2/70 text-[12px] uppercase tracking-wide text-text-3">
                <th className="p-2 font-medium"> </th>
                <th className="p-2 font-medium">Company</th>
                <th className="p-2 font-medium">Signal</th>
                <th className="p-2 font-medium">Confidence</th>
                <th className="p-2 font-medium">Update</th>
                <th className="p-2 font-medium">Signals</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-b-0">
                  <td className="p-2">
                    <span
                      className={cn(
                        "inline-block size-2 rounded-full",
                        r.polarity === "positive" ? dot.positive : dot[r.confidence]
                      )}
                    />
                  </td>
                  <td className="p-2 font-medium text-text-1">{r.companyName}</td>
                  <td className="p-2 text-text-2">{r.signalType}</td>
                  <td className="p-2">
                    <ConfidenceBadge level={r.confidence} />
                  </td>
                  <td className="p-2 text-text-3">{r.updateRef}</td>
                  <td className="p-2 tabular-nums text-text-2">{r.signalCount ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
