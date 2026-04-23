import { companies } from "@/data/company-seed";
import { cn } from "@/lib/utils";

const readiness = [
  { companyId: "lightspeed", score: 91, window: "12–18 mo", note: "Strong disclosure cadence" },
  { companyId: "nova", score: 84, window: "18–24 mo", note: "Stable metrics" },
  { companyId: "frank", score: 78, window: "18–30 mo", note: "Low flag load" },
  { companyId: "atlas", score: 71, window: "24–36 mo", note: "Authorship watch" },
  { companyId: "allhere", score: 58, window: "24–36 mo", note: "Metric volatility" },
  { companyId: "delve", score: 52, window: "36+ mo", note: "Irregular cadence" },
  { companyId: "kalder", score: 38, window: "Indefinite", note: "Dense flags" },
  { companyId: "nate", score: 22, window: "Indefinite", note: "Silence window" },
];

function rowTone(score: number) {
  if (score >= 71) return "text-green";
  if (score >= 45) return "text-amber";
  return "text-red";
}

export default function ExitReadinessPage() {
  return (
    <div className="p-8">
      <h1 className="mb-2 text-page-title text-text-1">Exit readiness</h1>
      <p className="mb-6 text-body text-text-2">
        Ranked table — liquidity window labels are descriptive only.
      </p>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[640px] text-left text-body">
          <thead>
            <tr className="border-b border-border bg-bg-2 text-[12px] uppercase text-text-3">
              <th className="p-2 font-medium">Score</th>
              <th className="p-2 font-medium">Company</th>
              <th className="p-2 font-medium">Liquidity window</th>
              <th className="p-2 font-medium">Note</th>
            </tr>
          </thead>
          <tbody>
            {readiness.map((r) => {
              const c = companies.find((x) => x.id === r.companyId);
              return (
                <tr key={r.companyId} className="border-b border-border last:border-b-0">
                  <td className={cn("p-2 font-semibold tabular-nums", rowTone(r.score))}>
                    {r.score}
                  </td>
                  <td className="p-2 font-medium text-text-1">{c?.name ?? r.companyId}</td>
                  <td className="p-2 text-text-2">{r.window}</td>
                  <td className="p-2 text-text-2">{r.note}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
