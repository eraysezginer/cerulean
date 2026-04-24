import { getPortfolioFlagsSorted } from "@/data/flags";
import { Button } from "@/components/ui/button";
import { ConfidenceBadge } from "@/components/cerulean/ConfidenceBadge";
import { cn } from "@/lib/utils";

const dot: Record<string, string> = {
  High: "bg-red",
  Medium: "bg-amber",
  Low: "bg-text-3",
};

export default async function ActiveFlagsPage() {
  const rows = await getPortfolioFlagsSorted();
  const high = rows.filter((r) => r.confidence === "High").length;

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-page-title text-text-1">Active flags</h1>
          <p className="text-body text-text-2">
            {rows.length} flag{rows.length === 1 ? "" : "s"} from document analysis
            {rows.length > 0 ? ` · ${high} high confidence` : ""} · sorted by severity
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
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[720px] text-left text-body">
            <thead>
              <tr className="border-b border-border bg-bg-2 text-[12px] uppercase tracking-wide text-text-3">
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
                    <span className={cn("inline-block size-2 rounded-full", dot[r.confidence])} />
                  </td>
                  <td className="p-2 font-medium text-text-1">{r.companyName}</td>
                  <td className="p-2 text-text-2">{r.signalType}</td>
                  <td className="p-2">
                    <ConfidenceBadge level={r.confidence} />
                  </td>
                  <td className="p-2 text-text-3">{r.updateRef}</td>
                  <td className="p-2 tabular-nums text-text-2">
                    {r.signalCount ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
