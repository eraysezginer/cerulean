import { notFound } from "next/navigation";
import { getCompanyById } from "@/data/companies";
import { getCapTableEventsForCompany } from "@/data/captable";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function CapTablePage({
  params,
}: {
  params: { id: string };
}) {
  const company = await getCompanyById(params.id);
  if (!company) notFound();

  const events = getCapTableEventsForCompany(company.id);

  return (
    <div className="p-8">
      <h1 className="mb-6 text-page-title text-text-1">
        {company.name} — Cap table
      </h1>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-bg-2 px-4 py-3 text-body text-text-2">
        <span>Carta Fund Administration · Last sync: 2h ago</span>
        <Button type="button" variant="outline" size="sm">
          Sync now
        </Button>
      </div>

      <div className="space-y-3">
        {events.map((e) => (
          <div
            key={e.id}
            className={cn(
              "rounded-lg border border-border bg-bg-2 p-3 pl-3 border-l-[3px]",
              e.border === "red" ? "border-l-red" : "border-l-green"
            )}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-card-title text-text-1">{e.kind}</span>
              {e.detail && (
                <span className="text-body text-text-2">{e.detail}</span>
              )}
              <span className="text-[12px] text-text-3">{e.date}</span>
              <span
                className={cn(
                  "ml-auto rounded px-2 py-0.5 text-[12px] font-medium",
                  e.disclosure.startsWith("Not")
                    ? "bg-red-light text-red"
                    : "bg-green-light text-green"
                )}
              >
                {e.disclosure}
              </span>
            </div>
          </div>
        ))}
      </div>

      <h2 className="mb-3 mt-10 text-section-label uppercase text-text-3">
        Waterfall — $12M acquisition scenario
      </h2>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[480px] text-body text-text-2">
          <thead>
            <tr className="border-b border-border bg-bg-2 text-[12px] uppercase text-text-3">
              <th className="p-2 text-left">Class</th>
              <th className="p-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="p-2">Preferred</td>
              <td className="p-2 text-right tabular-nums">$6.2M</td>
            </tr>
            <tr className="border-b border-border">
              <td className="p-2">Common</td>
              <td className="p-2 text-right tabular-nums">$3.1M</td>
            </tr>
            <tr className="border-b border-border">
              <td className="p-2">Options / pool</td>
              <td className="p-2 text-right tabular-nums">$1.4M</td>
            </tr>
            <tr>
              <td className="p-2">Investor tier A</td>
              <td className="p-2 text-right tabular-nums">$1.3M</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
